const Paytr = artifacts.require("Paytr");

contract("Paytr", (accounts) => {
  let paytrInstance;

  beforeEach(async () => {
    paytrInstance = await Paytr.new();
  });

  it("should allow a user to deposit funds", async () => {
    const depositAmount = web3.utils.toWei("1", "ether");
    await paytrInstance.deposit({ from: accounts[0], value: depositAmount });

    const balance = await paytrInstance.getBalance({ from: accounts[0] });
    assert.equal(balance.toString(), depositAmount, "Deposit amount is incorrect");
  });

  it("should allow a user to withdraw funds", async () => {
    const depositAmount = web3.utils.toWei("1", "ether");
    const withdrawalAmount = web3.utils.toWei("0.5", "ether");

    await paytrInstance.deposit({ from: accounts[0], value: depositAmount });
    await paytrInstance.withdraw(withdrawalAmount, { from: accounts[0] });

    const balance = await paytrInstance.getBalance({ from: accounts[0] });
    const expectedBalance = web3.utils.toWei("0.5", "ether");
    assert.equal(balance.toString(), expectedBalance, "Withdrawal amount is incorrect");
  });

  it("should emit Deposit event on deposit", async () => {
    const depositAmount = web3.utils.toWei("1", "ether");
    const receipt = await paytrInstance.deposit({ from: accounts[0], value: depositAmount });

    assert.equal(receipt.logs.length, 1, "Deposit event not emitted");
    assert.equal(receipt.logs[0].event, "Deposit", "Deposit event name is incorrect");
    assert.equal(receipt.logs[0].args.user, accounts[0], "Deposit event user is incorrect");
    assert.equal(receipt.logs[0].args.amount.toString(), depositAmount, "Deposit event amount is incorrect");
  });

  it("should emit Withdrawal event on withdrawal", async () => {
    const depositAmount = web3.utils.toWei("1", "ether");
    const withdrawalAmount = web3.utils.toWei("0.5", "ether");

    await paytrInstance.deposit({ from: accounts[0], value: depositAmount });
    const receipt = await paytrInstance.withdraw(withdrawalAmount, { from: accounts[0] });

    assert.equal(receipt.logs.length, 1, "Withdrawal event not emitted");
    assert.equal(receipt.logs[0].event, "Withdrawal", "Withdrawal event name is incorrect");
    assert.equal(receipt.logs[0].args.user, accounts[0], "Withdrawal event user is incorrect");
    assert.equal(receipt.logs[0].args.amount.toString(), withdrawalAmount, "Withdrawal event amount is incorrect");
  });
});
