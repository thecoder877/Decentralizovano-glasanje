const Voting = artifacts.require("Voting");

module.exports = function(deployer) {
  const candidateNames = ["Alice", "Bob", "Charlie"]; // Primer liste kandidata
  deployer.deploy(Voting, candidateNames);
};