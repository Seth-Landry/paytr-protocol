const Paytr = artifacts.require("Paytr");

contract("Paytr", (accounts) => {
  let paytrInstance;

  beforeEach(async () => {
    paytrInstance = await Paytr.new();
  });

  it("should allow users to deposit funds", async () => {
    const depositAmount = web3.utils.toWei("1", "ether");
    await paytrInstance.deposit({ from: accounts[0], value: depositAmount });

    const balance = await paytrInstance.getBalance({ from: accounts[0] });
    assert.equal(balance.toString(), depositAmount, "Deposit amount is incorrect");
  });

  it("should emit a Deposit event when funds are deposited", async () => {
    const depositAmount = web3.utils.toWei("1", "ether");
    const receipt = await paytrInstance.deposit({ from: accounts[0], value: depositAmount });

    assert.equal(receipt.logs.length, 1, "Deposit event should be emitted");
    assert.equal(receipt.logs[0].event, "Deposit", "Event name should be Deposit");
    assert.equal(receipt.logs[0].args.user, accounts[0], "Event user should be the depositor");
    assert.equal(receipt.logs[0].args.amount.toString(), depositAmount, "Event amount should be the deposited amount");
  });

  it("should allow users to withdraw funds", async () => {
    const depositAmount = web3.utils.toWei("1", "ether");
    await paytrInstance.deposit({ from: accounts[0], value: depositAmount });

    const withdrawAmount = web3.utils.toWei("0.5", "ether");
    await paytrInstance.withdraw(withdrawAmount, { from: accounts[0] });

    const balance = await paytrInstance.getBalance({ from: accounts[0] });
    const expectedBalance = web3.utils.toWei("0.5", "ether");
    assert.equal(balance.toString(), expectedBalance, "Withdrawal amount is incorrect");
  });

  it("should emit a Withdrawal event when funds are withdrawn", async () => {
    const depositAmount = web3.utils.toWei("1", "ether");
    await paytrInstance.deposit({ from: accounts[0], value: depositAmount });

    const withdrawAmount = web3.utils.toWei("0.5", "ether");
    const receipt = await paytrInstance.withdraw(withdrawAmount, { from: accounts[0] });

    assert.equal(receipt.logs.length, 1, "Withdrawal event should be emitted");
    assert.equal(receipt.logs[0].event, "Withdrawal", "Event name should be Withdrawal");
    assert.equal(receipt.logs[0].args.user, accounts[0], "Event user should be the withdrawer");
    assert.equal(receipt.logs[0].args.amount.toString(), withdrawAmount, "Event amount should be the withdrawn amount");
  });
});
