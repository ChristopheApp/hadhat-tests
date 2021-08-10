const { expect } = require("chai");
const { network } = require("hardhat");

let token
let ico
let owner
let addr1
let contractAsSigner0
let contractAsSigner1
let contractAsSigner2

beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    const DAOContract = await ethers.getContractFactory("Ballot");
    const TokenContract = await ethers.getContractFactory("Edu_Token");


    [addr1, addr2, addr3] = await ethers.getSigners();

    token = await TokenContract.deploy();
    dao = await DAOContract.deploy(["Formation no-code", "Alternance blockchain"], token.address);

    contractAsSigner0 = dao.connect(addr1);
    contractAsSigner1 = dao.connect(addr2);
    contractAsSigner2 = dao.connect(addr3);
  });

describe("Test Deploy", function () {
  it("Should return the winner name proposal", async function () {
    expect(await dao.winnerName()).to.equal("Formation no-code");
  });

  it("Should return a new proposal", async function () {
    const addProposalTx = await contractAsSigner0.addProposal("Formation dev mobile");

    await addProposalTx.wait()

    const proposal = await dao.proposals(2)
    console.log(proposal)
    expect(proposal.name).to.equal("Formation dev mobile");
  });

  it("Should vote", async function () {
    const addVoteTx = await contractAsSigner0.vote(1);

    await addVoteTx.wait()

    const proposal = await dao.proposals(1)
    expect(proposal.voteCount).to.equal("1000000000000000000000000");
  });

  xit("Should revert after timeout", async function () {
    const addVoteTx = await contractAsSigner0.vote(1);
    await addVoteTx.wait()

    await network.provider.send("evm_increaseTime", [3600])
    await network.provider.send("evm_mine")

    // const addVoteTx = await contractAsSigner0.vote(1);
    // await addVoteTx.wait()

    await expect(contractAsSigner0.vote(1)).to.be.reverted;

    const proposal = await dao.proposals(1)
    console.log(proposal)
    expect(proposal.voteCount).to.equal(1);
  });


});

xdescribe("Succesfull ICO", function () {
    it("Should return the amount of tokens of the investor 1", async function () {
        await contractAsSigner0.buyTokens(
            {
              value: ethers.utils.parseEther("1.0")
            })
            .then(async () => expect(await ico.contributorsToTokenAmount(addr1.address)).to.equal("1000000000000000000000") )
    });
  
    it("Should return the amount of tokens of the investor 2", async function () {
        await contractAsSigner1.buyTokens(
            {
              value: ethers.utils.parseEther("5.0")
            })
            .then(async () => expect(await ico.contributorsToTokenAmount(addr2.address)).to.equal("5000000000000000000000") )

    });

    it("Should return the amount of tokens of the investor 3", async function () {
        await contractAsSigner2.buyTokens(
            {
              value: ethers.utils.parseEther("10.0")
            })
            .then(async () => expect(await ico.contributorsToTokenAmount(addr3.address)).to.equal("10000000000000000000000") )

    });
  
  
  });