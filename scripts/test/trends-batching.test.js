/**
 * Tests for the Health Trends request batching and quota handling.
 *
 * The daily pipeline gets a small number of Health Trends requests. These
 * tests pin the two things that make that budget go further: one request
 * carries every indicator term, and a quota response is recognised (Google
 * reports it as HTTP 403 with a quota-shaped reason, not only 429) so the run
 * stops instead of spending requests it does not have.
 *
 * Run: node scripts/test/trends-batching.test.js
 */

const assert = require('assert');
const {
    buildTrendsGraphUrl,
    trendsPointsByTerm,
    describeTrendsFailure,
    describeTrendsSource,
    TRENDS_TERMS,
    TRENDS_MAX_REQUESTS,
    TRENDS_STATES_PER_RUN
} = require('../fetch-real-data.js');

let passed = 0;
const pending = [];
function test(name, fn) {
    pending.push(async () => {
        try {
            await fn();
            passed++;
            console.log(`  ✓ ${name}`);
        } catch (err) {
            console.error(`  ✗ ${name}\n    ${err.message}`);
            process.exitCode = 1;
        }
    });
}

function fakeResponse(status, body) {
    return {
        ok: status >= 200 && status < 300,
        status,
        async text() { return typeof body === 'string' ? body : JSON.stringify(body); }
    };
}

const TERMS = Object.values(TRENDS_TERMS).map(v => v[0]);

test('one request carries every indicator term as a repeated `terms` parameter', () => {
    const url = new URL(buildTrendsGraphUrl(TERMS, 'US-OH', '2026-06', 'k'));
    assert.deepStrictEqual(url.searchParams.getAll('terms'), TERMS);
    assert.strictEqual(url.searchParams.get('restrictions.geo'), 'US-OH');
    assert.strictEqual(url.searchParams.get('restrictions.startDate'), '2026-06');
    assert.strictEqual(url.searchParams.get('key'), 'k');
    assert.strictEqual(url.origin + url.pathname, 'https://www.googleapis.com/trends/v1beta/graph');
});

test('the budget spends one request on the national series and the rest on states', () => {
    assert.strictEqual(TRENDS_STATES_PER_RUN, TRENDS_MAX_REQUESTS - 1);
    assert.ok(TRENDS_STATES_PER_RUN >= 1);
});

test('response lines are matched to terms by their own `term` field, in any order', () => {
    const data = { lines: [
        { term: TERMS[2], points: [{ date: '2026-07-01', value: 5 }, { date: '2026-08-01', value: 7 }] },
        { term: TERMS[0], points: [{ date: '2026-08-01', value: 12 }] }
    ] };
    const byTerm = trendsPointsByTerm(data, TERMS);
    assert.deepStrictEqual(Object.keys(byTerm).sort(), [TERMS[0], TERMS[2]].sort());
    assert.strictEqual(byTerm[TERMS[2]][1].value, 7);
});

test('lines without a `term` fall back to request order, and empty lines are dropped', () => {
    const data = { lines: [
        { points: [{ date: '2026-08-01', value: 3 }] },
        { points: [] },
        null,
        { points: [{ date: '2026-08-01', value: 9 }] }
    ] };
    const byTerm = trendsPointsByTerm(data, TERMS);
    assert.deepStrictEqual(byTerm, { [TERMS[0]]: [{ date: '2026-08-01', value: 3 }], [TERMS[3]]: [{ date: '2026-08-01', value: 9 }] });
    assert.deepStrictEqual(trendsPointsByTerm({}, TERMS), {});
    assert.deepStrictEqual(trendsPointsByTerm(null, TERMS), {});
});

test('HTTP 403 dailyLimitExceeded is recognised as an exhausted quota', async () => {
    const failure = await describeTrendsFailure(fakeResponse(403, {
        error: { code: 403, message: 'Daily Limit Exceeded. The quota will be reset at midnight Pacific Time (PT).',
                 errors: [{ reason: 'dailyLimitExceeded', domain: 'usageLimits' }] }
    }));
    assert.strictEqual(failure.status, 403);
    assert.strictEqual(failure.reason, 'dailyLimitExceeded');
    assert.strictEqual(failure.quota, true);
});

test('HTTP 429 is an exhausted quota even without a JSON body', async () => {
    const failure = await describeTrendsFailure(fakeResponse(429, 'Too Many Requests'));
    assert.strictEqual(failure.quota, true);
    assert.strictEqual(failure.reason, null);
});

test('HTTP 403 for a disabled or forbidden key is a failure, not a quota stop', async () => {
    const failure = await describeTrendsFailure(fakeResponse(403, {
        error: { code: 403, message: 'The caller does not have permission', status: 'PERMISSION_DENIED' }
    }));
    assert.strictEqual(failure.quota, false);
    assert.strictEqual(failure.reason, 'PERMISSION_DENIED');
});

test('HTTP 400 is recorded with its message and never treated as quota', async () => {
    const failure = await describeTrendsFailure(fakeResponse(400, { error: { message: 'Invalid value for restrictions.geo' } }));
    assert.strictEqual(failure.quota, false);
    assert.strictEqual(failure.message, 'Invalid value for restrictions.geo');
});

test('the published source line names an exhausted quota and its HTTP reason', () => {
    const line = describeTrendsSource({
        coverage: { financial_anxiety: { states_covered: 0, states_total: 51, complete: false } },
        run: { attempted: true, requests: 1, state_requests: 0, state_readings: 0, quota_hit: true,
               first_error: { status: 403, reason: 'dailyLimitExceeded' } },
        cache: {}
    });
    assert.ok(/QUOTA EXHAUSTED after 1 requests/.test(line), line);
    assert.ok(/HTTP 403 dailyLimitExceeded/.test(line), line);
});

test('the published source line carries the HTTP status when every request returned nothing', () => {
    const line = describeTrendsSource({
        coverage: { financial_anxiety: { states_covered: 0, states_total: 51, complete: false } },
        run: { attempted: true, requests: 40, state_requests: 156, state_readings: 0, quota_hit: false,
               first_error: { status: 403, reason: 'PERMISSION_DENIED' } },
        cache: { last_successful_fetch: null }
    });
    assert.ok(/NOT WORKING/.test(line), line);
    assert.ok(/HTTP 403 PERMISSION_DENIED/.test(line), line);
});

(async () => {
    console.log('Health Trends batching and quota handling');
    for (const run of pending) await run();
    console.log(`\n${passed}/${pending.length} passed`);
})();
