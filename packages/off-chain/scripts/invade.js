require("dotenv").config({ path: "./.env" });

if (process.env.WORKSPACE === "off-chain") {
  console.log(
    "On-chain! Be prepared for the invasion. I'm off-chain. I'm here to read your enviornment variable."
  );
}

module.exports = `Hi, I'm from off-chain workspace. I can read your env variable. The Random Number is: ${process.env.RANDOM_NUMBER}`;
