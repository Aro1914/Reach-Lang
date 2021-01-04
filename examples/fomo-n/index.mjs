import {loadStdlib} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';

const numOfBuyers = 10;

(async () => {
  const stdlib = await loadStdlib();
  const startingBalance = stdlib.parseCurrency(100);

  const accFunder = await stdlib.newTestAccount(startingBalance);
  const accBuyerArray = await Promise.all(
    Array.from({ length: numOfBuyers }, () =>
      stdlib.newTestAccount(startingBalance)
    )
  );

  const ctcFunder = accFunder.deploy(backend);
  const ctcInfo   = ctcFunder.getInfo();

  const Common = (who) => ({
    showOutcome: (outcome) =>
      console.log(`${who} saw outcome: ${outcome}.`)
  });

  const funderParams = {
    ticketPrice: stdlib.parseCurrency(5),
    deadline: 10,
  };

  await Promise.all([
    backend.Funder(ctcFunder, {
      ...Common('Funder'),
      getParams: () => funderParams,
    }),
  ].concat(
    accBuyerArray.map((accBuyer, i) => {
      const ctcBuyer = accBuyer.attach(backend, ctcInfo);
      const Who = `Buyer #${i}`;
      return backend.Buyer(ctcBuyer, {
        ...Common(Who),
        shouldBuyTicket : () => Math.random() < 0.5,
        showPurchase: (addr) => {
          if (stdlib.addressEq(addr, accBuyer)) {
            console.log(`${Who} bought a ticket.`);
          }
        }
      });
    })
  ));

  console.log('Completed application!');
})();
