import re

with open('css/housing-stories.css', 'r', encoding='utf-8') as f:
    css = f.read()

new_drivers = """/* Interactive Drivers Component - Redesign */
.interactive-drivers {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  margin-top: 10px;
}

.drivers-intro {
  margin-bottom: 20px;
  font-weight: 500;
  color: #e2e8f0;
  text-align: center;
  font-size: 0.95rem;
}

.drivers-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
}

.driver-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 107, 53, 0.4);
  color: #FF6B35;
  padding: 10px 18px;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

.driver-btn:hover {
  background: #FF6B35;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 53, 0.3);
  border-color: #FF6B35;
}

.driver-info-box {
  background: rgba(15, 23, 42, 0.6);
  padding: 20px;
  border-radius: 16px;
  border-left: 4px solid #FF6B35;
  font-size: 0.95rem;
  color: #cbd5e1;
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.driver-info-box.hidden {
  display: none;
  opacity: 0;
  transform: translateY(-10px);
}

.driver-info-box.visible {
  display: block;
  opacity: 1;
  transform: translateY(0);
}

.driver-info-box h4 {
  margin-bottom: 10px;
  color: #f8fafc;
  font-weight: 700;
  font-size: 1.1rem;
}

/* AI Search Tool Component - Redesign */
.ai-search-tool {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
  margin-top: 10px;
  position: relative;
  overflow: hidden;
}

.ai-search-tool::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: linear-gradient(90deg, #FF6B35, #ff9f1c, #4fd1c5);
}

.ai-search-tool h3 {
  color: #f8fafc;
  font-weight: 800;
  margin-bottom: 10px;
  font-size: 1.3rem;
  letter-spacing: -0.5px;
}

.ai-search-tool p {
  color: #94a3b8;
  font-size: 0.95rem;
  margin-bottom: 24px;
  line-height: 1.5;
}

.ai-input-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ai-input-group input, .ai-input-group select {
  padding: 14px 18px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;
  background: rgba(15, 23, 42, 0.6);
  color: #f8fafc;
}

.ai-input-group input:focus, .ai-input-group select:focus {
  outline: none;
  border-color: #FF6B35;
  box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.15);
  background: rgba(15, 23, 42, 0.8);
}

.ai-btn {
  background: #FF6B35;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.2);
}

.ai-btn::after {
  content: '→';
  transition: transform 0.3s ease;
}

.ai-btn:hover {
  background: #ff5010;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(255, 107, 53, 0.4);
}

.ai-btn:hover::after {
  transform: translateX(6px);
}

.ai-results {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideUpFade 0.5s ease forwards;
}

.ai-results.hidden {
  display: none;
}

.ai-results h4 {
  color: #f8fafc;
  margin-bottom: 16px;
  font-size: 1.1rem;
}

.ai-resource-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ai-resource-list li {
  margin-bottom: 12px;
  background: rgba(15, 23, 42, 0.4);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.ai-resource-list li:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(15, 23, 42, 0.6);
}

.ai-resource-list a {
  text-decoration: none;
  color: #cbd5e1;
  font-size: 0.9rem;
  display: block;
}

.ai-resource-list a strong {
  color: #4fd1c5;
  display: block;
  margin-bottom: 6px;
  font-size: 1rem;
}

.ai-resource-list a:hover strong {
  color: #38b2ac;
}

.ai-footnote {
  font-size: 0.8rem !important;
  color: #64748b !important;
  margin-top: 20px !important;
  margin-bottom: 0 !important;
  text-align: center;
}

.loader {
  font-weight: 600;
  color: #FF6B35;
  text-align: center;
  padding: 20px;
  position: relative;
}

.loader::after {
  content: '...';
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.nav-area {
  display: none !important;
  pointer-events: none !important;
}"""

# Find the start of Interactive Drivers Component
# and replace everything from there to the end.
start_idx = css.find("/* Interactive Drivers Component */")
if start_idx != -1:
    css = css[:start_idx] + new_drivers
else:
    css += "\n" + new_drivers

with open('css/housing-stories.css', 'w', encoding='utf-8') as f:
    f.write(css)
