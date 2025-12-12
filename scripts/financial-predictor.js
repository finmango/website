/**
 * Financial Health Predictor Script (Enhanced Rule-Based)
 * Handles chat interactions with intent recognition and simulated AI responses.
 */

console.log("Financial Predictor Script Loaded v3");

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
            step: 'intro',
            gatheringField: null,
            data: {
                income: null,
                expenses: null,
                debt: null,
                savings: null
            },
            history: []
        };

        // --- Knowledge Base & Intents ---
        const INTENTS = {
            GREETING: ['hi', 'hello', 'hey', 'start', 'begin'],
            RESET: ['reset', 'restart', 'start over', 'clear', 'new'],
            HELP: ['help', 'what can you do', 'options', '?'],

            // Trigger phrases to start the health check flow
            START_HEALTH_CHECK: [
                'score', 'check', 'analyze', 'health', 'go',
                'saving', 'enough', 'buy', 'car', 'house', 'afford',
                'debt', 'loan', 'money', 'financial', 'budget',
                'assess', 'evaluate', 'test', 'calculate'
            ],

            DEFINITIONS: {
                'emergency fund': "💰 An **Emergency Fund** is money set aside for unexpected costs like medical bills or car repairs. Experts recommend saving 3-6 months of essential expenses.",
                '50/30/20': "📊 The **50/30/20 Rule** is a simple budgeting framework:\n• 50% for Needs (rent, food, utilities)\n• 30% for Wants (entertainment, dining out)\n• 20% for Savings & Debt repayment",
                'debt snowball': "⛄ The **Debt Snowball** method: Pay off your smallest debts first while making minimum payments on larger ones. The quick wins build momentum!",
                'debt avalanche': "🏔️ The **Debt Avalanche** method: Pay off debts with the highest interest rates first. This saves more money over time but takes more discipline.",
                'compound interest': "📈 **Compound Interest** is when you earn interest on both your initial money AND the interest already earned. It's how savings grow exponentially over time!",
                'dti': "📉 **Debt-to-Income (DTI)** ratio = Monthly debt payments ÷ Monthly income. Lenders prefer a DTI under 36%. Above 43% may make it hard to get approved for loans.",
                'credit score': "💳 Your **Credit Score** (300-850) reflects your creditworthiness. Key factors: payment history (35%), amounts owed (30%), credit history length (15%), new credit (10%), credit mix (10%)."
            },

            ADVICE_TOPICS: {
                'save': "💡 **Saving Tips:**\n1. Pay yourself first—automate transfers to savings on payday\n2. Start with just $25/week if that's all you can manage\n3. Use the 24-hour rule before impulse purchases",
                'budget': "📋 **Budgeting Basics:**\n1. Track every dollar for 30 days\n2. Try the 50/30/20 rule\n3. Use apps like Mint or YNAB to automate tracking",
                'invest': "📊 **Investing 101:**\n1. First, max out any employer 401(k) match—it's free money!\n2. Start with low-cost index funds\n3. Time in market > timing the market",
                'credit': "🏦 **Credit Building:**\n1. Always pay bills on time\n2. Keep credit utilization under 30%\n3. Don't close old accounts—length of history matters"
            }
        };

        // --- Chat Functions ---
        function addMessage(text, sender = 'bot') {
            const div = document.createElement('div');
            div.className = `message ${sender}`;
            div.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

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

            setTimeout(() => {
                const response = generateSmartResponse(msg);
                hideTyping();
                addMessage(response);
                state.history.push({ role: 'bot', content: response });
                updateDashboard();
            }, 600 + Math.random() * 600);
        }

        // --- Enhanced Logic ---
        function generateSmartResponse(msg) {
            const lowerMsg = msg.toLowerCase();

            // 1. Reset
            if (INTENTS.RESET.some(word => lowerMsg.includes(word))) {
                resetState();
                return "🔄 I've cleared your data. Let's start fresh!\n\nWhat would you like to do?\n• Check your **financial health score**\n• Ask about financial terms\n• Get **saving** or **budgeting** tips";
            }

            // 2. Help
            if (INTENTS.HELP.some(word => lowerMsg.includes(word))) {
                return "🙋 **I can help you with:**\n\n• Calculate your **Financial Health Score**\n• Explain terms like **50/30/20**, **DTI**, or **compound interest**\n• Give tips on **saving**, **budgeting**, **investing**, or **credit**\n\nJust type what's on your mind!";
            }

            // 3. Knowledge Base (Definitions)
            for (const [term, definition] of Object.entries(INTENTS.DEFINITIONS)) {
                if (lowerMsg.includes(term)) {
                    return definition;
                }
            }

            // 4. Advice Topics
            for (const [topic, advice] of Object.entries(INTENTS.ADVICE_TOPICS)) {
                if (lowerMsg.includes(topic)) {
                    return advice;
                }
            }

            // 5. State Machine for Data Collection
            if (state.step === 'intro') {
                // Check if ANY trigger word matches
                if (INTENTS.START_HEALTH_CHECK.some(word => lowerMsg.includes(word))) {
                    state.step = 'gathering_data';
                    state.gatheringField = 'income';
                    return "📊 Great! Let's calculate your **Financial Health Score**.\n\nI'll need 4 quick numbers. Don't worry, this stays private—nothing is stored.\n\n**Question 1/4:** What is your **monthly take-home income** (after taxes)?";
                }

                // Greetings
                if (INTENTS.GREETING.some(word => lowerMsg === word || lowerMsg.startsWith(word + ' ') || lowerMsg.startsWith(word + '!'))) {
                    return "👋 Hi there! I'm your Financial Health Assistant.\n\nI can help you:\n• Calculate your **financial health score**\n• Explain terms like **compound interest**\n• Share tips on **saving** and **budgeting**\n\nWhat would you like to explore?";
                }

                // If nothing else matched, still try to be helpful by starting the flow
                return "🤔 I'm not quite sure what you mean, but I'd love to help!\n\nWant me to **check your financial health**? Just say 'yes' or 'go' and I'll walk you through it.\n\nOr ask me about topics like **saving**, **investing**, or **credit scores**.";
            }

            if (state.step === 'gathering_data') {
                const val = extractNumber(msg);

                if (state.gatheringField === 'income') {
                    if (val !== null && val > 0) {
                        state.data.income = val;
                        state.gatheringField = 'expenses';
                        return `✅ Got it: **$${formatNumber(val)}/month**\n\n**Question 2/4:** How much do you spend on **essential monthly expenses**? (rent, food, utilities, insurance)`;
                    }
                    return "🔢 I need a number for your income. You can type it like:\n• 3000\n• $4,500\n• 50k (for annual, I'll divide by 12)";
                }

                if (state.gatheringField === 'expenses') {
                    if (val !== null && val >= 0) {
                        state.data.expenses = val;
                        state.gatheringField = 'debt';
                        return `✅ **$${formatNumber(val)}/month** in expenses.\n\n**Question 3/4:** What is your **total outstanding debt**? (credit cards, student loans, car loans, etc.)\n\nIf you have no debt, just say \"0\" or \"none\".`;
                    }
                    return "🔢 Please enter your monthly expenses as a number.";
                }

                if (state.gatheringField === 'debt') {
                    if (val !== null && val >= 0) {
                        state.data.debt = val;
                        state.gatheringField = 'savings';
                        return `✅ **$${formatNumber(val)}** in debt recorded.\n\n**Question 4/4 (last one!):** How much do you have in **total savings**? (emergency fund, savings accounts, cash)`;
                    }
                    return "🔢 Please enter your total debt. If none, type \"0\".";
                }

                if (state.gatheringField === 'savings') {
                    if (val !== null && val >= 0) {
                        state.data.savings = val;
                        state.step = 'complete';
                        state.gatheringField = null;

                        const score = calculateScore();
                        const analysis = getDetailedAnalysis(score);

                        setTimeout(updateDashboard, 100);

                        return `🎉 **Analysis Complete!**\n\n${getScoreEmoji(score)} Your Financial Health Score is **${score}/100**\n\n${analysis}\n\n💡 Type **\"tips\"** for personalized improvement suggestions, or **\"reset\"** to start over.`;
                    }
                    return "🔢 Last question! How much do you have saved?";
                }
            }

            if (state.step === 'complete') {
                if (lowerMsg.includes('tip') || lowerMsg.includes('improve') || lowerMsg.includes('better') || lowerMsg.includes('how')) {
                    return getPersonalizedTips();
                }
                return `📊 Your score is **${calculateScore()}/100**.\n\nWant **tips** to improve? Or say **reset** to check again with different numbers.`;
            }

            return "🤔 I'm focused on financial health topics. Try asking:\n• \"Check my health score\"\n• \"What is an emergency fund?\"\n• \"How can I save more?\"";
        }

        // --- Utility Functions ---
        function extractNumber(str) {
            let processed = str.toLowerCase().replace(/[$,]/g, '').trim();

            // Handle "k" notation for thousands
            const kMatch = processed.match(/([\d.]+)\s*k/);
            if (kMatch) {
                return parseFloat(kMatch[1]) * 1000;
            }

            // Handle regular numbers
            const match = processed.match(/[\d.]+/);
            if (match) {
                return parseFloat(match[0]);
            }

            // Handle words
            if (processed.includes('zero') || processed.includes('none') || processed === 'no' || processed === '0') {
                return 0;
            }
            return null;
        }

        function formatNumber(num) {
            return num.toLocaleString('en-US');
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

            // Savings resilience (months of runway)
            const monthlyBurn = expenses || 1;
            const monthsRunway = savings / monthlyBurn;
            if (monthsRunway >= 6) points += 25;
            else if (monthsRunway >= 3) points += 15;
            else if (monthsRunway >= 1) points += 5;
            else points -= 10;

            // Debt burden
            const annualIncome = income * 12;
            const debtToIncome = debt / annualIncome;
            if (debt === 0) points += 15;
            else if (debtToIncome < 0.2) points += 10;
            else if (debtToIncome < 0.4) points += 0;
            else if (debtToIncome < 0.8) points -= 10;
            else points -= 20;

            // Savings rate
            const monthlySavings = income - expenses;
            const savingsRate = monthlySavings / income;
            if (savingsRate >= 0.20) points += 10;
            else if (savingsRate >= 0.10) points += 5;
            else if (savingsRate >= 0) points += 0;
            else points -= 15;

            return Math.max(0, Math.min(100, Math.round(points)));
        }

        function getScoreEmoji(score) {
            if (score >= 80) return "🌟";
            if (score >= 60) return "✅";
            if (score >= 40) return "⚠️";
            return "🚨";
        }

        function getDetailedAnalysis(score) {
            const { income, expenses, debt, savings } = state.data;
            const monthsRunway = savings / (expenses || 1);
            const savingsRate = ((income - expenses) / income * 100).toFixed(0);

            let analysis = "";

            if (score >= 80) {
                analysis = "**Excellent!** You have a strong financial foundation with healthy savings and manageable debt.";
            } else if (score >= 60) {
                analysis = "**Good.** You're on the right track, but there's room to improve your financial cushion.";
            } else if (score >= 40) {
                analysis = "**Fair.** Your finances need some attention. High expenses or debt may be holding you back.";
            } else {
                analysis = "**Critical.** Your financial health needs immediate attention. Let's focus on building a safety net.";
            }

            analysis += `\n\n**Quick Stats:**\n• Savings Rate: ${savingsRate}%\n• Emergency Runway: ${monthsRunway.toFixed(1)} months\n• Debt-to-Annual-Income: ${((debt / (income * 12)) * 100).toFixed(0)}%`;

            return analysis;
        }

        function getPersonalizedTips() {
            const { income, expenses, debt, savings } = state.data;
            const monthsRunway = savings / (expenses || 1);
            const savingsRate = (income - expenses) / income;
            const debtToIncome = debt / (income * 12);

            let tips = "💡 **Personalized Recommendations:**\n\n";

            if (monthsRunway < 3) {
                tips += "1️⃣ **Build your emergency fund first.** Aim for at least 3 months of expenses. Even $50/week adds up.\n\n";
            }

            if (savingsRate < 0.10) {
                tips += "2️⃣ **Increase your savings rate.** Try the 50/30/20 rule. Cut one subscription or expense to free up cash.\n\n";
            }

            if (debtToIncome > 0.3) {
                tips += "3️⃣ **Tackle high-interest debt.** Consider the Debt Avalanche method to save on interest.\n\n";
            }

            if (tips === "💡 **Personalized Recommendations:**\n\n") {
                tips = "🌟 **You're doing great!** Keep it up.\n\nNext steps to level up:\n• Max out retirement contributions\n• Look into low-cost index funds\n• Consider diversifying income streams";
            }

            return tips;
        }

        // --- Dashboard Updates ---
        function updateDashboard() {
            const { income, expenses, debt, savings } = state.data;
            const score = calculateScore();

            overallScoreEl.textContent = (state.step === 'complete') ? score : '--';

            const scoreCircle = document.querySelector('.score-circle');
            if (scoreCircle) {
                const color = score >= 60 ? '#10B981' : (score >= 40 ? '#F59E0B' : '#EF4444');
                scoreCircle.style.background = `conic-gradient(${color} ${score * 3.6}deg, #e5e7eb 0deg)`;
            }

            if (income) {
                if (expenses !== null) {
                    const rate = ((income - expenses) / income) * 100;
                    savingsVal.textContent = rate.toFixed(0) + '%';
                    savingsBar.style.width = Math.max(0, Math.min(100, rate)) + '%';
                    savingsBar.style.backgroundColor = rate > 20 ? '#10B981' : (rate > 5 ? '#F59E0B' : '#EF4444');
                }

                if (debt !== null) {
                    const dti = (debt / (income * 12)) * 100;
                    debtVal.textContent = '$' + formatNumber(debt);
                    debtBar.style.width = Math.min(100, dti) + '%';
                    debtBar.style.backgroundColor = dti < 20 ? '#10B981' : (dti < 40 ? '#F59E0B' : '#EF4444');
                }

                if (savings !== null && expenses) {
                    const runway = savings / (expenses || 1);
                    resilienceVal.textContent = runway.toFixed(1) + ' mo';
                    resilienceBar.style.width = Math.min(100, (runway / 6) * 100) + '%';
                    resilienceBar.style.backgroundColor = runway >= 3 ? '#10B981' : (runway >= 1 ? '#F59E0B' : '#EF4444');
                }
            }
        }

        function resetDashboard() {
            overallScoreEl.textContent = '--';
            const scoreCircle = document.querySelector('.score-circle');
            if (scoreCircle) {
                scoreCircle.style.background = 'conic-gradient(#e5e7eb 0deg, #e5e7eb 360deg)';
            }

            savingsVal.textContent = '—';
            savingsBar.style.width = '0%';
            debtVal.textContent = '—';
            debtBar.style.width = '0%';
            resilienceVal.textContent = '—';
            resilienceBar.style.width = '0%';
        }

        // --- Event Listeners ---
        sendBtn.addEventListener('click', () => {
            const msg = userInput.value.trim();
            if (msg) processUserMessage(msg);
        });

        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const msg = userInput.value.trim();
                if (msg) processUserMessage(msg);
            }
        });

        console.log("Financial Predictor Initialized Successfully v3");
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
