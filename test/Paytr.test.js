const Paytr = artifacts.require("Paytr");

contract("Paytr", accounts => {
  const [owner, user1, user2] = accounts;

  it("should allow users to deposit funds", async () => {
    const paytrInstance = await Paytr.deployed();
    const depositAmount = web3.utils.toWei("1", "ether");

    await paytrInstance.deposit({ from: user1, value: depositAmount });

    const balance = await paytrInstance.getBalance({ from: user1 });
    assert.equal(balance.toString(), depositAmount, "Deposit amount is incorrect");
  });

  it("should emit a Deposit event when funds are deposited", async () => {
    const paytrInstance = await Paytr.deployed();
    const depositAmount = web3.utils.toWei("1", "ether");

    const receipt = await paytrInstance.deposit({ from: user1, value: depositAmount });

    assert.equal(receipt.logs.length, 1, "Deposit event not emitted");
    assert.equal(receipt.logs[0].event, "Deposit", "Deposit event type is incorrect");
    assert.equal(receipt.logs[0].args.user, user1, "Deposit event user is incorrect");
    assert.equal(receipt.logs[0].args.amount.toString(), depositAmount, "Deposit event amount is incorrect");
  });

  it("should allow users to withdraw funds", async () => {
    const paytrInstance = await Paytr.deployed();
    const depositAmount = web3.utils.toWei("1", "ether");
    const withdrawAmount = web3.utils.toWei("0.5", "ether");

    await paytrInstance.deposit({ from: user1, value: depositAmount });
    await paytrInstance.withdraw(withdrawAmount, { from: user1 });

    const balance = await paytrInstance.getBalance({ from: user1 });
    const expectedBalance = web3.utils.toWei("0.5", "ether");
    assert.equal(balance.toString(), expectedBalance, "Withdrawal amount is incorrect");
  });

  it("should emit a Withdrawal event when funds are withdrawn", async () => {
    const paytrInstance = await Paytr.deployed();
    const depositAmount = web3.utils.toWei("1", "ether");
    const withdrawAmount = web3.utils.toWei("0.5", "ether");

    await paytrInstance.deposit({ from: user1, value: depositAmount });
    const receipt = await paytrInstance.withdraw(withdrawAmount, { from: user1 });

    assert.equal(receipt.logs.length, 1, "Withdrawal event not emitted");
    assert.equal(receipt.logs[0].event, "Withdrawal", "Withdrawal event type is incorrect");
    assert.equal(receipt.logs[0].args.user, user1, "Withdrawal event user is incorrect");
    assert.equal(receipt.logs[0].args.amount.toString(), withdrawAmount, "Withdrawal event amount is incorrect");
  });

  it("should not allow deposits of zero or negative amounts", async () => {
    const paytrInstance = await Paytr.deployed();

    try {
      await paytrInstance.deposit({ from: user1, value: 0 });
      assert.fail("Deposit of zero should not be allowed");
    } catch (error) {
      assert.include(error.message, "Deposit amount must be greater than zero", "Incorrect error message for zero deposit");
    }

    try {
      await paytrInstance.deposit({ from: user1, value: -1 });
      assert.fail("Deposit of negative amount should not be allowed");
    } catch (error) {
      assert.include(error.message, "Deposit amount must be greater than zero", "Incorrect error message for negative deposit");
    }
  });

  it("should not allow withdrawals of zero or negative amounts", async () => {
    const paytrInstance = await Paytr.deployed();
    const depositAmount = web3.utils.toWei("1", "ether");

    await paytrInstance.deposit({ from: user1, value: depositAmount });

    try {
      await paytrInstance.withdraw(0, { from: user1 });
      assert.fail("Withdrawal of zero should not be allowed");
    } catch (error) {
      assert.include(error.message, "Withdrawal amount must be greater than zero", "Incorrect error message for zero withdrawal");
    }

    try {
      await paytrInstance.withdraw(-1, { from: user1 });
      assert.fail("Withdrawal of negative amount should not be allowed");
    } catch (error) {
      assert.include(error.message, "Withdrawal amount must be greater than zero", "Incorrect error message for negative withdrawal");
    }
  });

  it("should not allow withdrawals exceeding the user's balance", async () => {
    const paytrInstance = await Paytr.deployed();
    const depositAmount = web3.utils.toWei("1", "ether");
    const withdrawAmount = web3.utils.toWei("2", "ether");

    await paytrInstance.deposit({ from: user1, value: depositAmount });

    try {
      await paytrInstance.withdraw(withdrawAmount, { from: user1 });
      assert.fail("Withdrawal exceeding balance should not be allowed");
    } catch (error) {
      assert.include(error.message, "Insufficient balance", "Incorrect error message for excessive withdrawal");
    }
  });
});
