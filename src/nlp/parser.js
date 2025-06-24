import nlp from "compromise";

let walletBalance = 7250;
let cryptoWallet = {
  USDT: 48.2,
  SOL: 15.5,
};

const mockPin = "1234";
let pinAttempts = 0;

// Utilities
const extractAmount = (text) => {
  const match = text.match(/(\d+(?:[kK])?)/);
  if (!match) return null;
  const val = match[1];
  return val.toLowerCase().includes("k")
    ? parseFloat(val) * 1000
    : parseFloat(val);
};

const extractNetwork = (text) => {
  const nets = ["mtn", "glo", "airtel", "9mobile"];
  return nets.find((n) => text.toLowerCase().includes(n));
};

const extractBank = (text) => {
  const banks = [
    "gtbank",
    "opay",
    "kuda",
    "zenith",
    "uba",
    "access",
    "firstbank",
  ];
  return banks.find((b) => text.toLowerCase().includes(b));
};

const extractCrypto = (text) => {
  if (text.includes("sol") || text.includes("solana")) return "SOL";
  return "USDT";
};

const getRate = (coin) => (coin === "SOL" ? 11200 : 1250);

export const handleMessage = async (input, context = {}) => {
  const msg = input.toLowerCase().trim();
  const doc = nlp(msg);
  let updatedContext = { ...context };

  // ------------------------
  // Handle awaiting responses
  // ------------------------
  if (context.awaiting) {
    // Check if user wants to switch to another intent
    if (msg.includes("airtime")) {
      updatedContext = {
        currentIntent: "airtime",
        awaiting: "amount",
        data: {},
      };
      return {
        reply: "Alright, how much airtime would you like to recharge?",
        updatedContext,
      };
    }

    if (msg.includes("send") || msg.includes("transfer")) {
      updatedContext = {
        currentIntent: "send_money",
        awaiting: "amount",
        data: {},
      };
      return {
        reply: "Got it. How much do you want to send?",
        updatedContext,
      };
    }

    if (
      msg.includes("buy") &&
      (msg.includes("usdt") || msg.includes("sol") || msg.includes("crypto"))
    ) {
      updatedContext = {
        currentIntent: "buy_crypto",
        awaiting: "amount",
        data: {},
      };
      return {
        reply: "Okay, how much ₦ do you want to use to buy crypto?",
        updatedContext,
      };
    }

    if (msg.includes("balance") && !msg.includes("crypto")) {
      return {
        reply: `💰 Your current wallet balance is ₦${walletBalance.toLocaleString()}.`,
        updatedContext,
      };
    }

    if (msg.includes("crypto wallet") || msg.includes("check crypto")) {
      const reply = Object.entries(cryptoWallet)
        .map(([k, v]) => `• ${k}: ${v}`)
        .join("\n");

      return {
        reply: `🔐 Your crypto wallet:\n${reply}`,
        updatedContext: {},
      };
    }

    // Continue with original awaiting switch
    switch (context.awaiting) {
      case "amount":
        const amount = extractAmount(msg);
        if (!amount) {
          return {
            reply:
              "I didn’t catch the amount. Try something like '₦500' or '2k'.",
            updatedContext,
          };
        }

        updatedContext.data.amount = amount;

        if (context.currentIntent === "send_money") {
          updatedContext.awaiting = "recipient";
          return {
            reply: "Who are you sending the money to?",
            updatedContext,
          };
        }

        if (context.currentIntent === "airtime") {
          updatedContext.awaiting = "network";
          return {
            reply: "Got it. Which network? MTN, Glo, Airtel, or 9mobile?",
            updatedContext,
          };
        }

        if (context.currentIntent === "buy_crypto") {
          const coin = updatedContext.data.coin || extractCrypto(msg);
          const rate = getRate(coin);
          const units = (amount / rate).toFixed(2);

          if (amount > walletBalance) {
            return {
              reply: `❌ Insufficient balance. Your wallet: ₦${walletBalance.toLocaleString()}`,
              updatedContext: {},
            };
          }

          updatedContext.awaiting = "confirm_crypto";
          updatedContext.data = { amount, coin, rate, units };

          return {
            reply: `You're about to buy ${units} ${coin} for ₦${amount} at ₦${rate}/unit.\nShall I proceed? (yes/no)`,
            updatedContext,
          };
        }

        return {
          reply: "Okay, amount noted. What would you like to do next?",
          updatedContext,
        };

      case "network":
        const network = extractNetwork(msg);
        if (!network) {
          return {
            reply:
              "Hmm, that doesn't look like a valid network. MTN, Glo, Airtel, or 9mobile?",
            updatedContext,
          };
        }
        updatedContext.data.network = network;
        updatedContext.awaiting = "phone_number";
        return {
          reply: `Great! Please enter the 11-digit phone number to recharge (e.g. 09012345678).`,
          updatedContext,
        };

      case "phone_number":
        const phone = msg.replace(/\s+/g, "");
        const phoneRegex = /^(070|080|081|090|091|091|081|089)\d{8}$/;

        if (!phoneRegex.test(phone)) {
          return {
            reply:
              "❌ That doesn’t look like a valid Nigerian number. It should be 11 digits like 09012345678.",
            updatedContext,
          };
        }

        if (!updatedContext.data) updatedContext.data = {};
        updatedContext.data.phone = phone;
        const amt = updatedContext.data.amount || 0;
        const net = updatedContext.data.network || "UNKNOWN";

        return {
          reply: `✅ Airtime purchase successful!\nYou’ve recharged ₦${amt} on ${net.toUpperCase()} for ${phone}. 🎉`,
          updatedContext: {},
        };

      case "recipient":
        updatedContext.data.recipient = msg;
        updatedContext.awaiting = "bank";
        return {
          reply:
            "Which bank does the recipient use? (GTBank, Opay, Kuda, etc.)",
          updatedContext,
        };

      case "bank":
        const bank = extractBank(msg);
        if (!bank) {
          return {
            reply:
              "I didn’t catch that. Please mention a valid bank like GTBank, Opay, or Kuda.",
            updatedContext,
          };
        }
        updatedContext.data.bank = bank;
        updatedContext.awaiting = "account_number";
        return {
          reply: `💼Current Wallet Balance: ₦${walletBalance.toLocaleString()}\n\nPlease enter the 10-digit account number for ${
            updatedContext.data.recipient
          }.`,
          updatedContext,
        };

      case "pin":
        if (/^\d{4}$/.test(msg)) {
          if (msg === mockPin) {
            pinAttempts = 0;
            const { amount, recipient, bank, accountNumber } =
              updatedContext.data;
            return {
              reply: `✅ PIN verified!\n₦${amount} sent successfully to ${recipient} (${bank.toUpperCase()}, Acct: ${accountNumber}). 🎉`,
              updatedContext: {},
            };
          } else {
            pinAttempts++;
            if (pinAttempts >= 3) {
              return {
                reply:
                  "❌ Too many incorrect attempts. Chat ended for security reasons.",
                updatedContext: {},
              };
            }
            return {
              reply: `❌ Incorrect PIN. Please try again. (${pinAttempts}/3)`,
              updatedContext,
            };
          }
        } else {
          return {
            reply: "Please enter a valid 4-digit PIN.",
            updatedContext,
          };
        }

      case "account_number":
        const accountNumber = msg.replace(/\D/g, "");
        if (!/^\d{10}$/.test(accountNumber)) {
          return {
            reply:
              "❌ That’s not a valid account number. Please enter a 10-digit number.",
            updatedContext,
          };
        }

        updatedContext.data.accountNumber = accountNumber;
        updatedContext.awaiting = "pin";
        return {
          reply: `You're sending ₦${updatedContext.data.amount} to ${
            updatedContext.data.recipient
          } (${updatedContext.data.bank.toUpperCase()}, ${accountNumber}). Please enter your 4-digit PIN to confirm.`,
          updatedContext,
        };

      case "confirm_crypto":
        if (msg.includes("yes")) {
          const { amount, coin, units } = updatedContext.data;

          if (amount > walletBalance) {
            return {
              reply: `❌ Insufficient balance. Your wallet: ₦${walletBalance.toLocaleString()}`,
              updatedContext: {},
            };
          }

          walletBalance -= amount;
          cryptoWallet[coin] = (cryptoWallet[coin] || 0) + parseFloat(units);

          return {
            reply: `✅ Crypto purchase successful!\n• Bought: ${units} ${coin}\n• Debited: ₦${amount}\n• New Wallet Balance: ₦${walletBalance.toLocaleString()}`,
            updatedContext: {},
          };
        } else {
          return {
            reply:
              "❌ Purchase cancelled. Let me know if you want to try again.",
            updatedContext: {},
          };
        }

      default:
        return {
          reply:
            "Hmm, I’m waiting for something else. Could you please repeat?",
          updatedContext,
        };
    }
  }

  // ------------------------
  // New Intents
  // ------------------------

  // Greetings
  if (
    [
      "hi",
      "hello",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
      "good day",
      "What's up",
      "What can you do",
      "Tell me about you",
    ].some((greet) => msg.includes(greet))
  ) {
    return {
      reply: `👋 Hello! I'm Zipu 🤖 — your smart finance assistant.\n\nI can help you with:\n• Buying airtime 📱\n• Sending money 💸\n• Buying crypto 💰\n• Checking balances 🧾\n\nHow can I assist you today?`,
      updatedContext,
    };
  }

  // Airtime
  if (msg.includes("airtime") || msg.includes("recharge")) {
    const amount = extractAmount(msg);
    const network = extractNetwork(msg);

    if (!amount && !network) {
      updatedContext = {
        currentIntent: "airtime",
        awaiting: "amount",
        data: {},
      };
      return {
        reply: "How much airtime would you like to recharge?",
        updatedContext,
      };
    }

    if (amount && !network) {
      updatedContext = {
        currentIntent: "airtime",
        awaiting: "network",
        data: { amount },
      };
      return {
        reply: "Which network should I recharge? MTN, Glo, Airtel, or 9mobile?",
        updatedContext,
      };
    }

    if (!amount && network) {
      updatedContext = {
        currentIntent: "airtime",
        awaiting: "amount",
        data: { network },
      };
      return {
        reply: "Okay, and how much airtime should I recharge?",
        updatedContext,
      };
    }

    return {
      reply: `✅ Airtime purchase successful: \n₦${amount} for ${network.toUpperCase()}.`,
      updatedContext: {},
    };
  }

  // Balance check
  if (msg.includes("balance") && !msg.includes("crypto")) {
    return {
      reply: `💰 Your current wallet balance is ₦${walletBalance.toLocaleString()}.`,
      updatedContext: {},
    };
  }

  // Send money
  if (msg.includes("send") || msg.includes("transfer")) {
    const amount = extractAmount(msg);
    const bank = extractBank(msg);
    const recipient =
      doc.match("to [#Person+]")?.text()?.replace("to ", "") || null;

    if (!amount) {
      updatedContext = {
        currentIntent: "send_money",
        awaiting: "amount",
        data: {},
      };
      return { reply: "How much do you want to send?", updatedContext };
    }

    if (!recipient) {
      updatedContext = {
        currentIntent: "send_money",
        awaiting: "recipient",
        data: { amount },
      };
      return { reply: "Who are you sending the money to?", updatedContext };
    }

    if (!bank) {
      updatedContext = {
        currentIntent: "send_money",
        awaiting: "bank",
        data: { amount, recipient },
      };
      return {
        reply: `Which bank does ${recipient} use? (GTBank, Opay, etc.)`,
        updatedContext,
      };
    }

    updatedContext = {
      currentIntent: "send_money",
      awaiting: "pin",
      data: { amount, recipient, bank },
    };
    return {
      reply: `You're sending ₦${amount} to ${recipient} (${bank.toUpperCase()}). Please enter your 4-digit PIN to confirm.`,
      updatedContext,
    };
  }

  // Buy crypto (start conversation)
  if (
    msg.includes("buy") &&
    (msg.includes("usdt") || msg.includes("sol") || msg.includes("crypto"))
  ) {
    const amount = extractAmount(msg);
    const coin = extractCrypto(msg);
    const rate = getRate(coin);
    const units = amount ? (amount / rate).toFixed(2) : null;

    if (!amount) {
      updatedContext = {
        currentIntent: "buy_crypto",
        awaiting: "amount",
        data: { coin },
      };
      return {
        reply: `How much ₦ do you want to use to buy ${coin}?`,
        updatedContext,
      };
    }

    if (amount > walletBalance) {
      return {
        reply: `❌ Insufficient balance. Your wallet: ₦${walletBalance.toLocaleString()}`,
        updatedContext: {},
      };
    }

    updatedContext = {
      currentIntent: "buy_crypto",
      awaiting: "confirm_crypto",
      data: { amount, coin, units, rate },
    };

    return {
      reply: `You're about to buy ${units} ${coin} for ₦${amount} at ₦${rate}/unit.\nShall I proceed? (yes/no)`,
      updatedContext,
    };
  }

  // Check crypto balance
  if (msg.includes("crypto wallet") || msg.includes("check crypto")) {
    const reply = Object.entries(cryptoWallet)
      .map(([k, v]) => `• ${k}: ${v}`)
      .join("\n");

    return {
      reply: `🔐 Your crypto wallet:\n${reply}`,
      updatedContext: {},
    };
  }

  // Pidgin or typo triggers
  if (msg.includes("abeg") || msg.includes("airtim")) {
    updatedContext = { currentIntent: "airtime", awaiting: "amount", data: {} };
    return {
      reply: "Oya na! How much airtime you wan buy and for which network?",
      updatedContext,
    };
  }

  // Default fallback
  return {
    reply:
      "🤔 I didn’t quite get that. Do you want to buy airtime, send money, check balance, or buy crypto?",
    updatedContext: {},
  };
};
