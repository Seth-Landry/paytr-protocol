const Paytr = artifacts.require("Paytr");

contract("Paytr", (accounts) => {
  let paytr;

  beforeEach(async () => {
    paytr = await Paytr.new();
  });

  it("should allow users to deposit funds", async () => {
    const depositAmount = web3.utils.toWei("1", "ether");
    await paytr.deposit({ from: accounts[0], value: depositAmount });

    const balance = await paytr.getBalance({ from: accounts[0] });
    assert.equal(balance.toString(), depositAmount, "Balance should match deposit amount");

    const depositEvent = await paytr.getPastEvents("Deposit", { fromBlock: 0, toBlock: "latest" });
    assert.equal(depositEvent.length, 1, "Deposit event should be emitted");
    assert.equal(depositEvent[0].returnValues.user, accounts[0], "Deposit event user should match");
    assert.equal(depositEvent[0].returnValues.amount, depositAmount, "Deposit event amount should match");
  });

  it("should allow users to withdraw funds", async () => {
    const depositAmount = web3.utils.toWei("1", "ether");
    const withdrawAmount = web3.utils.toWei("0.5", "ether");

    await paytr.deposit({ from: accounts[0], value: depositAmount });
    await paytr.withdraw(withdrawAmount, { from: accounts[0] });

    const balance = await paytr.getBalance({ from: accounts[0] });
    const expectedBalance = web3.utils.toWei("0.5", "ether");
    assert.equal(balance.toString(), expectedBalance, "Balance should match remaining amount after withdrawal");

    const withdrawalEvent = await paytr.getPastEvents("Withdrawal", { fromBlock: 0, toBlock: "latest" });
    assert.equal(withdrawalEvent.length, 1, "Withdrawal event should be emitted");
    assert.equal(withdrawalEvent[0].returnValues.user, accounts[0], "Withdrawal event user should match");
    assert.equal(withdrawalEvent[0].returnValues.amount, withdrawAmount, "Withdrawal event amount should match");
  });

  it("should handle edge cases for deposit function", async () => {
    try {
      await paytr.deposit({ from: accounts[0], value: 0 });
      assert.fail("Deposit with zero amount should fail");
    } catch (error) {
      assert.include(error.message, "Deposit amount must be greater than zero", "Error message should match");
    }
  });

  it("should handle edge cases for withdraw function", async () => {
    const depositAmount = web3.utils.toWei("1", "ether");
    await paytr.deposit({ from: accounts[0], value: depositAmount });

    try {
      await paytr.withdraw(0, { from: accounts[0] });
      assert.fail("Withdrawal with zero amount should fail");
    } catch (error) {
      assert.include(error.message, "Withdrawal amount must be greater than zero", "Error message should match");
    }

    try {
      const excessiveAmount = web3.utils.toWei("2", "ether");
      await paytr.withdraw(excessiveAmount, { from: accounts[0] });
      assert.fail("Withdrawal with excessive amount should fail");
    } catch (error) {
      assert.include(error.message, "Insufficient balance", "Error message should match");
    }
  });
});
