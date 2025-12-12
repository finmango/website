/**
 * Financial Health Predictor Script (Enhanced Rule-Based)
 * Handles chat interactions with intent recognition and simulated AI responses.
 */

console.log("Financial Predictor Script Loaded");

(function () {
    function init() {
        console.log("Initializing Financial Predictor...");

        // --- Elements ---
        const messagesContainer = document.getElementById('chat-messages');
        const userInput = document.getElementById('user-input');
        const sendBtn = document.getElementById('send-btn');
        const typingIndicator = document.getElementById('typing-indicator');

        // Check required elements
        if (!messagesContainer || !userInput || !sendBtn || !typingIndicator) {
            console.error("Critical elements missing:", { messagesContainer, userInput, sendBtn, typingIndicator });
            return;
        }

        // Dashboard Elements
        const overallScoreEl = document.getElementById('overall-score');
        const savingsVal = document.getElementById('savings-val');
        const savingsBar = document.getElementById('savings-bar');
        const debtVal = document.getElementById('debt-val');
        const debtBar = document.getElementById('debt-bar');
        const resilienceVal = document.getElementById('resilience-val');
        const resilienceBar = document.getElementById('resilience-bar');

        // --- State ---
        let state = {
            step: 'intro', // intro, gathering_data, complete
            gatheringField: null, // income, expenses, debt, savings
            data: {
                income: null,
                expenses: null,
                debt: null,
                savings: null
            },
            history: [] // Keep track of conversation
        };

        // --- Knowledge Base & Intents ---
        const INTENTS = {
            GREETING: ['hi', 'hello', 'hey', 'start', 'begin'],
            RESET: ['reset', 'restart', 'start over', 'clear', 'again'],
            HELP: ['help', 'what can you do', 'options'],
            DEFINITIONS: {
                'emergency fund': "An **Emergency Fund** is money set aside for unexpected costs like medical bills or car repairs. Aim for 3-6 months of essential expenses.",
                '50/30/20': "The **50/30/20 Rule** suggests spending 50% of income on needs, 30% on wants, and 20% on savings/debt repayment.",
                'debt snowball': "The **Debt Snowball** method involves paying off your smallest debts first to build momentum.",
                'debt avalanche': "The **Debt Avalanche** method focuses on paying off debts with the highest interest rates first to save money over time.",
                'compound interest': "**Compound Interest** is when you earn interest on both your initial money and the interest you've already earned. It helps your savings grow faster!",
                'dti': "**Debt-to-Income (DTI)** ratio compares how much you owe each month to how much you earn. Lenders look for a DTI under 36%."
            },
            ADVICE_TOPICS: {
                'save': "To start saving, pay yourself first! Set up automatic transfers to a savings account on payday.",
                'budget': "Budgeting is just telling your money where to go. Try the 50/30/20 rule to maximize your paycheck.",
                'invest': "Investing is key to building wealth. If your employer offers a 401(k) match, make sure to take advantage of it—it's free money!",
                'credit': "To build good credit, pay your bills on time and keep your credit card balances low (aim for under 30% utilization)."
            }
        };

        // --- Chat Functions ---
        function addMessage(text, sender = 'bot') {
            const div = document.createElement('div');
            div.className = `message ${sender}`;
            div.innerHTML = text.replace(/\n/g, '<br>');

            const time = document.createElement('div');
            time.className = 'message-time';
            time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            div.appendChild(time);

            messagesContainer.appendChild(div);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function showTyping() {
            typingIndicator.style.display = 'flex';
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function hideTyping() {
            typingIndicator.style.display = 'none';
        }

        async function processUserMessage(msg) {
            if (!msg.trim()) return;

            addMessage(msg, 'user');
            userInput.value = '';
            state.history.push({ role: 'user', content: msg });

            showTyping();

            // Simulate "thinking" delay
            setTimeout(() => {
                const response = generateSmartResponse(msg);
                hideTyping();
                addMessage(response);
                state.history.push({ role: 'bot', content: response });
                updateDashboard();
            }, 800 + Math.random() * 800);
        }

        // --- Enhanced Logic (The "Smart" Part) ---
        function generateSmartResponse(msg) {
            const lowerMsg = msg.toLowerCase();

            // 1. Check Global Intents (Reset, Help)
            if (INTENTS.RESET.some(word => lowerMsg.includes(word))) {
                resetState();
                return "I've cleared your data and reset the dashboard. How can I help you regarding your finances today?";
            }

            if (lowerMsg.includes('help') || lowerMsg === '?') {
                return "I can help you check your financial health score, define terms (like 'compound interest' or '50/30/20 rule'), or offer saving tips.\n\nTry saying: **\"Check my health score\"** or **\"What is an emergency fund?\"**";
            }

            // 2. Check Knowledge Base (Definitions & Tips)
            for (const [term, definition] of Object.entries(INTENTS.DEFINITIONS)) {
                if (lowerMsg.includes(term)) {
                    return definition + "\n\nWould you like to see how this applies to *your* finances?";
                }
            }

            for (const [topic, advice] of Object.entries(INTENTS.ADVICE_TOPICS)) {
                if (lowerMsg.includes(topic)) {
                    return advice;
                }
            }

            // 3. State Machine for Data Collection
            if (state.step === 'intro') {
                if (lowerMsg.includes('score') || lowerMsg.includes('check') || lowerMsg.includes('analyze') || lowerMsg.includes('health') || lowerMsg.includes('go')) {
                    state.step = 'gathering_data';
                    state.gatheringField = 'income';
                    return "Let's calculate your Financial Health Score. I'll need 4 quick numbers.\n\nFirst: What is your **monthly take-home income**?";
                }
                if (INTENTS.GREETING.some(word => lowerMsg === word || lowerMsg.startsWith(word + ' '))) {
                    return "Hi there! I'm here to help you make sense of your money. You can ask for advice, define financial terms, or calculate your Financial Health Score.";
                }
            }

            if (state.step === 'gathering_data') {
                const val = extractNumber(msg);

                if (state.gatheringField === 'income') {
                    if (val !== null) {
                        state.data.income = val;
                        state.gatheringField = 'expenses';
                        return `Got it, $${formatNumber(val)}/month. \n\nNext: How much are your **essential monthly expenses** (rent, food, utilities)?`;
                    }
                    return "I couldn't quite catch the number. How much is your monthly income? (e.g., '3000' or '$3k')";
                }

                if (state.gatheringField === 'expenses') {
                    if (val !== null) {
                        state.data.expenses = val;
                        state.gatheringField = 'debt';
                        return `Okay. Now, what is your **total outstanding debt** (credit cards, loans)? If none, just say "0".`;
                    }
                    return "Could you verify your monthly expenses amount?";
                }

                if (state.gatheringField === 'debt') {
                    if (val !== null) {
                        state.data.debt = val;
                        state.gatheringField = 'savings';
                        return "Almost done. Finally: What is your **total savings balance** (emergency fund + cash)?";
                    }
                    return "Please tell me your total debt amount (or say 'none' or '0').";
                }

                if (state.gatheringField === 'savings') {
                    if (val !== null) {
                        state.data.savings = val;
                        state.step = 'complete';
                        state.gatheringField = null;

                        const score = calculateScore();
                        const analysis = getDetailedAnalysis(score);

                        // Trigger confident Dashboard update
                        setTimeout(updateDashboard, 100);

                        return `All set! Analysis complete.\n\nYour Financial Health Score is **${score}/100**.\n\n${analysis}\n\nAsk me if you want tips on how to improve this!`;
                    }
                    return "Just one last number: your total savings?";
                }
            }

            if (state.step === 'complete') {
                if (lowerMsg.includes('improve') || lowerMsg.includes('better') || lowerMsg.includes('tip')) {
                    const score = calculateScore();
                    if (score < 50) return "Based on your score, I recommend the **'Back to Basics'** approach. \n1. Track every dollar for 30 days.\n2. Cut one discretionary expense.\n3. Try to save $500 as a starter emergency fund.";
                    if (score < 80) return "Values look okay, but we can optimize! \n1. Review your high-interest debt.\n2. Check if you can increase your savings rate to 20%.\n3. Ensure your emergency fund covers at least 3 months.";
                    return "You're doing great! To level up: \n1. Max out retirement contributions.\n2. Look into low-cost index funds.\n3. Consider diversifying your income streams.";
                }
                return "I've updated the dashboard with your latest report. Ask 'reset' to start over, or ask for 'tips' to improve your score.";
            }

            return "I'm focusing on financial health, but I'm not sure how to answer that yet. Try asking for 'help' to see what I can do!";
        }

        // --- Utility Functions ---
        function extractNumber(str) {
            // Handle "k" notation (e.g., 50k => 50000)
            let processed = str.toLowerCase().replace(/,/g, '');
            if (processed.includes('k')) {
                processed = processed.replace('k', '000');
            }

            const match = processed.match(/[\d.]+/);
            if (match) {
                return parseFloat(match[0]);
            }

            if (str.toLowerCase().includes('zero') || str.toLowerCase().includes('none') || str.toLowerCase().includes('no')) {
                return 0;
            }
            return null;
        }

        function formatNumber(num) {
            return num.toLocaleString();
        }

        function resetState() {
            state = {
                step: 'intro',
                gatheringField: null,
                data: { income: null, expenses: null, debt: null, savings: null },
                history: []
            };
            resetDashboard();
        }

        function calculateScore() {
            const { income, expenses, debt, savings } = state.data;
            if (!income) return 0;

            let points = 50;

            // 1. Savings Ratio (Weight: High)
            // Aim for savings > 3x monthly expenses
            const monthlyBurn = expenses || 1;
            const monthsRunway = savings / monthlyBurn;

            if (monthsRunway >= 6) points += 25;
            else if (monthsRunway >= 3) points += 15;
            else if (monthsRunway >= 1) points += 5;
            else points -= 15;

            // 2. Debt Burden (Weight: High)
            // Simple debt-to-income check
            const debtToAnnual = debt / (income * 12);
            if (debtToAnnual === 0) points += 15;
            else if (debtToAnnual < 0.3) points += 5;
            else if (debtToAnnual > 0.8) points -= 20;
            else points -= 5;

            // 3. Cash Flow (Weight: Medium)
            const netFlow = income - expenses;
            const savingsRate = netFlow / income;

            if (savingsRate >= 0.20) points += 10; // 50/30/20 ideal
            else if (savingsRate >= 0.10) points += 5;
            else if (savingsRate < 0) points -= 15; // Living beyond means

            return Math.max(0, Math.min(100, Math.round(points)));
        }

        function getDetailedAnalysis(score) {
            if (score >= 80) return "🌟 **Excellent!** Your financial foundation is rock solid. You have good liquidity and manageable debt. Now is the time to focus on wealth building and investments.";
            if (score >= 60) return "✅ **Good.** You are stable, but there are a few cracks. Prioritize building your emergency fund to 6 months expenses to boost your resilience score.";
            if (score >= 40) return "⚠️ **Fair.** You're treading water. Your expenses might be too high relative to your income, or debt is eating into your cash flow. Let's look at budgeting strategies.";
            return "🚨 **Critical.** Your financial health needs immediate attention. High debt or low savings are putting you at risk. We should focus on the 'Debt Snowball' method and cutting non-essential costs immediately.";
        }

        // --- Dashboard Updates ---
        function updateDashboard() {
            const { income, expenses, debt, savings } = state.data;
            const score = calculateScore();

            // Overall Score
            overallScoreEl.textContent = (state.step === 'complete') ? score : '--';

            // Visual Color for Score Circle
            const startColor = score > 60 ? '#10B981' : (score > 40 ? '#F59E0B' : '#EF4444');
            document.querySelector('.score-circle').style.background = `conic-gradient(${startColor} ${score * 3.6}deg, #eee 0deg)`;

            // Only update metrics if we have the data
            if (income) {
                // Savings Rate
                if (expenses !== null) {
                    const rate = ((income - expenses) / income) * 100;
                    savingsVal.textContent = rate.toFixed(1) + '%';
                    savingsBar.style.width = Math.max(0, Math.min(100, rate)) + '%';
                    savingsBar.style.backgroundColor = rate > 20 ? '#10B981' : (rate > 5 ? '#F59E0B' : '#EF4444');
                }

                // Debt Load (Using DTI proxy)
                if (debt !== null) {
                    const pseudoDTI = (debt * 0.03) / income; // Approx monthly payment 3%
                    const dtiPercent = pseudoDTI * 100;
                    debtVal.textContent = '$' + formatNumber(debt);
                    // Invert bar: Low debt is good
                    debtBar.style.width = Math.min(100, dtiPercent * 2) + '%'; // Scale up for visibility
                    debtBar.style.backgroundColor = dtiPercent < 15 ? '#10B981' : (dtiPercent < 36 ? '#F59E0B' : '#EF4444');
                }

                // Resilience (Months of Runway)
                if (savings !== null && expenses) {
                    const runway = savings / (expenses || 1);
                    resilienceVal.textContent = runway.toFixed(1) + ' Mo';
                    resilienceBar.style.width = Math.min(100, (runway / 6) * 100) + '%'; // Scale to 6 months
                    resilienceBar.style.backgroundColor = runway > 3 ? '#10B981' : (runway > 1 ? '#F59E0B' : '#EF4444');
                }
            }
        }

        function resetDashboard() {
            overallScoreEl.textContent = '--';
            document.querySelector('.score-circle').style.background = 'conic-gradient(#eee 0deg, #eee 360deg)';

            savingsVal.textContent = 'Unknown';
            savingsBar.style.width = '0%';
            savingsBar.style.backgroundColor = '#ccc';

            debtVal.textContent = 'Unknown';
            debtBar.style.width = '0%';
            debtBar.style.backgroundColor = '#ccc';

            resilienceVal.textContent = 'Unknown';
            resilienceBar.style.width = '0%';
            resilienceBar.style.backgroundColor = '#ccc';
        }

        // --- Event Listeners ---
        sendBtn.addEventListener('click', () => {
            const msg = userInput.value.trim();
            if (msg) processUserMessage(msg);
        });

        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const msg = userInput.value.trim();
                if (msg) processUserMessage(msg);
            }
        });

        console.log("Financial Predictor Initialized Successfully");
    }

    // Robust loading check
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM already ready, run immediately
        init();
    }
})();
