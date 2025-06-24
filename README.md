# Zipu WhatsApp AI Chatbot 💬🤖

A lightweight, intelligent **finance assistant** built with **React** and simple NLP. Zipu helps users carry out common fintech tasks like buying airtime, sending money, checking balances, and buying crypto — all through **natural conversations**.

---

## 🚀 Features

- 💬 Conversational UI inspired by WhatsApp
- 🧠 Smart NLP with context memory using `compromise`
- 🔁 Handles intent switches mid-conversation
- 📱 Mobile-first responsive design
- ✨ Smooth animations with `framer-motion`

### 🔧 Supported Tasks:
- 📱 Airtime purchases  
- 💸 Money transfers  
- 💰 Crypto buying  
- 🧾 Balance checks  

---

## 🧰 Tech Stack

| Tool / Library     | Purpose                          |
|--------------------|----------------------------------|
| **JavaScript (ES6+)** | App logic                      |
| **React**          | UI components & state handling   |
| **Compromise**     | Natural Language Processing (NLP) |
| **Framer Motion**  | UI animations                    |
| **CSS**            | Custom styling                   |

---

## 📸 Preview

<img src="./public/Screenshot (171).png" alt="Zipu Chatbot Screenshot" style="width=300; border-radius: 10px;" />

---

## 🛠️ How to Run

```bash
git clone https://github.com/suchael/zipu-chatbot-qualifier.git
cd zipu-chatbot
npm install
npm run dev


> 💡 **Default PIN for all transactions:** `1234`  
> 🔐 Bot blocks after 3 failed attempts.


## 💬 Example Prompts

Here are some messages the chatbot understands:

### Airtime Recharge
- `"Buy ₦500 airtime for MTN"`
- `"Recharge 1k Glo"`
- `"Send 200 naira to my number"`

### Send Money
- `"Send ₦5,000 to Chioma Opay"`
- `"Transfer 2k to John GTBank"`

### Crypto Transactions
- `"Buy ₦10,000 worth of USDT"`
- `"Get me Solana worth ₦5k"`

### Check Balances
- `"What’s my balance?"`
- `"Check my crypto wallet"`

### Pidgin / Typos (Bonus)
- `"Abeg send me 1k airtim"`
- `"By MTN 500"`  
*(Handled gracefully)*