// src/utils/accounting.js

/**
 * Calculates the current balance for a specific subhead from a list of all ledger entries.
 * This function applies standard accounting rules based on the account's head type.
 *
 * @param {number} subheadId The ID of the subhead to calculate the balance for.
 * @param {Array<Object>} allLedgerEntries The complete array of ledger data.
 * @returns {string} A formatted string representing the balance (e.g., "1500.00 Cr" or "500.00 Dr").
 */
export const calculateBalanceForSubhead = (subheadId, allLedgerEntries) => {
  if (!subheadId || !allLedgerEntries || allLedgerEntries.length === 0) {
    return '0.00';
  }

  // 1. Filter all transactions for the given subhead
  const transactions = allLedgerEntries.filter(
    (entry) => entry.subhead?.subheadId === subheadId
  );

  if (transactions.length === 0) {
    return '0.00';
  }

  // 2. Get the account's head name from the first transaction
  // It's assumed to be the same for all transactions of a subhead.
  const headName = transactions[0].headId?.headName || 'Unknown';

  // 3. Sum up all credits and debits for this subhead
  const { totalCredit, totalDebit } = transactions.reduce(
    (acc, entry) => {
      acc.totalCredit += Number(entry.crAmt) || 0;
      acc.totalDebit += Number(entry.drAmt) || 0;
      return acc;
    },
    { totalCredit: 0, totalDebit: 0 }
  );

  let balance = 0;
  let balanceType = '';

  // 4. Apply the Golden Rules of Accounting based on the Head Type
  switch (headName.toLowerCase()) {
    // ASSETS & EXPENSES: Balance = Debits - Credits. A positive result is a Debit balance.
    case 'loans & advances (asset)':
    case 'bank accounts':
    case 'cash in hand':
    case 'sundry debtors':
    case 'indirect expenses':
    case 'direct expenses':
    case 'misc. expenses (asset)':
      balance = totalDebit - totalCredit;
      balanceType = ' Dr'; // Dr stands for Debit
      break;

    // LIABILITIES & INCOMES: Balance = Credits - Debits. A positive result is a Credit balance.
    case 'loans (liability)':
    case 'sundry creditors':
    case 'capital account':
    case 'income (direct)':
    case 'income (indirect)':
    case 'branch / divisions': // Often treated as a liability/capital from head office view
      balance = totalCredit - totalDebit;
      balanceType = ' Cr'; // Cr stands for Credit
      break;

    default:
      // If the head type is unknown, default to a standard liability/credit calculation.
      console.warn(`Unknown head type: "${headName}". Using default balance calculation.`);
      balance = totalCredit - totalDebit;
      balanceType = ' Cr';
      break;
  }

  // 5. Return the formatted string
  // Math.abs is used because the "Dr" or "Cr" suffix already indicates the nature of the balance.
  return `${Math.abs(balance).toFixed(2)}${balanceType}`;
};