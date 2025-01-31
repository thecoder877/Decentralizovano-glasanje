const Voting = artifacts.require("Voting");

contract("Voting", (accounts) => {
    let votingInstance;

    before(async () => {
        votingInstance = await Voting.new(["Kandidat 1", "Kandidat 2"]);
    });

    it("treba da registruje glas", async () => {
        await votingInstance.vote(1, { from: accounts[0] });
        const candidate = await votingInstance.candidates(1);
        assert.equal(candidate.voteCount.toNumber(), 1, "Glas nije dodat");
    });

    it("treba da spreci dvostruko glasanje", async () => {
        try {
            await votingInstance.vote(1, { from: accounts[0] });
            assert.fail("Glasanje je trebalo da bude odbijeno!");
        } catch (error) {
            assert.include(error.message, "Vec ste glasali!", "Poruka nije ispravna");
        }
    });
});