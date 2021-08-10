const { expect } = require("chai")

let token
let ico
let owner, addr1, addr2, addr3, addrs
let contractAsSigner0, contractAsSigner1, contractAsSigner2

beforeEach(async function () {
  // Get the ContractFactory and Signers here.
  const TokenContract = await ethers.getContractFactory("WCS_Token");
  const ICOContract = await ethers.getContractFactory("WCS_ICO");

  [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();

  token = await TokenContract.deploy();
  ico = await ICOContract.deploy(token.address, 7884000);

  contractAsSigner0 = ico.connect(addr1);
  contractAsSigner1 = ico.connect(addr2);
  contractAsSigner2 = ico.connect(addr3);

  await token.transfer(ico.address, "1000000000000000000000000");
})

describe("Test Deploy", function () {
  it("Should return the total supply", async function () {
    expect(await token.totalSupply()).to.equal("1000000000000000000000000");
  })

  it("Should return the time left before the end of the ICO", async function () {
    expect((await ico.timeleft()).toNumber()).to.greaterThan(0);
  })
})

describe("Successful ICO", function () {
  xit("Should return the amount of tokens of the investor 1", async function () {
    const buyTokensTx = await contractAsSigner0.buyTokens(
      {
        value: ethers.utils.parseEther("1.0")
      }
    )

    await buyTokensTx.wait()
    
    expect((await ico.contributorsToTokenAmount(addr1.address)).toString()).to.equal("1000000000000000000000")
  })

  xit("Should return the amount of tokens of the investor 2", async function () {
    contractAsSigner1.buyTokens(
      {
        value: ethers.utils.parseEther("5.0")
      }
    ).then(async () => expect((await ico.contributorsToTokenAmount(addr2.address)).toString()).equal("5000000000000000000000"))
  })

  xit("Should return the amount of tokens of the investor 3", async function () {
    contractAsSigner2.buyTokens(
      {
        value: ethers.utils.parseEther("10.0")
      }
    ).then(async () => expect((await ico.contributorsToTokenAmount(addr3.address)).toString()).to.equal("10000000000000000000000"))
  })

  it("Should return the amount of tokens received of the investor 1 when the ICO is successful", async function () {
    const buyTokensTx = await contractAsSigner0.buyTokens(
      {
        value: ethers.utils.parseEther("1.0")
      }
    )

    await buyTokensTx.wait()
    
    expect((await ico.contributorsToTokenAmount(addr1.address)).toString()).to.equal("1500000000000000000000")

    await network.provider.send("evm_increaseTime", [2628000])
    await network.provider.send("evm_mine") // this one will have 10s more

    const buyTokens2Tx = await contractAsSigner1.buyTokens(
      {
        value: ethers.utils.parseEther("5.0")
      }
    )

    await buyTokens2Tx.wait()
    
    expect((await ico.contributorsToTokenAmount(addr2.address)).toString()).to.equal("6250000000000000000000")

    await network.provider.send("evm_increaseTime", [2628000])
    await network.provider.send("evm_mine") // this one will have 10s more

    const buyTokens3Tx = await contractAsSigner2.buyTokens(
      {
        value: ethers.utils.parseEther("10.0")
      }
    )

    await buyTokens3Tx.wait()
    
    expect((await ico.contributorsToTokenAmount(addr3.address)).toString()).to.equal("10000000000000000000000")

    await network.provider.send("evm_increaseTime", [2628000])
    await network.provider.send("evm_mine") // this one will have 10s more

    const finalizeTx = await ico.finalize()

    await finalizeTx.wait();

    expect(await ico.isFinalized()).to.equal(true)

    const withdrawTx = await contractAsSigner0.withdraw()

    await withdrawTx.wait()

    expect(await token.balanceOf(addr1.address)).to.equal("1500000000000000000000")

    const withdrawTx1 = await contractAsSigner1.withdraw()

    await withdrawTx1.wait()

    expect(await token.balanceOf(addr2.address)).to.equal("6250000000000000000000")

    const withdrawTx2 = await contractAsSigner2.withdraw()

    await withdrawTx2.wait()

    expect(await token.balanceOf(addr3.address)).to.equal("10000000000000000000000")
  })
})