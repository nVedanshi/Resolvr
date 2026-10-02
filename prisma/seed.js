/**
 * Seeds the database with realistic small-company support requests.
 *
 * Run with: npm run db:seed
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Anchor for all relative timestamps, captured once so the data stays consistent. */
const now = Date.now();
// Returns a timestamp the given duration before the seed run.
const ago = (ms) => new Date(now - ms);

const tickets = [
  {
    title: 'Duplicate order #44812 created by double click',
    description:
      'A customer placed order #44812 twice within a few seconds. Both orders were charged. They have asked us to cancel the second one and refund it to the original card.',
    customerEmail: 'orders@harborline-supply.com',
    priority: 'HIGH',
    status: 'OPEN',
    createdAt: ago(38 * MINUTE),
  },
  {
    title: 'CSV export of March invoices is empty',
    description:
      'Exporting invoices for March produces a file with only headers. Filtering by "paid" makes rows appear, so it looks specific to outstanding invoices. Reproduced on Chrome and Firefox.',
    customerEmail: 'accounts@pemberton-supplies.co.uk',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdAt: ago(3 * HOUR),
  },
  {
    title: 'Cannot log in after enabling two-factor authentication',
    description:
      'The customer enabled 2FA yesterday and now the app rejects their password. The authenticator app works fine. They have lost their recovery codes and need the account unlocked.',
    customerEmail: 'it@westfieldjoinery.com',
    priority: 'HIGH',
    status: 'OPEN',
    createdAt: ago(5 * HOUR),
  },
  {
    title: 'Shipping labels for EU orders missing customs code',
    description:
      'All labels generated for German and Dutch destinations omit the HS code, so parcels are held at customs. Batch of roughly 60 labels needs regenerating once fixed.',
    customerEmail: 'logistics@brightmoor-goods.com',
    priority: 'HIGH',
    status: 'OPEN',
    createdAt: ago(9 * HOUR),
  },
  {
    title: 'Tax ID missing from PDF invoice',
    description:
      'VAT registration number is saved on the company profile but does not appear on the generated PDF invoice. The customer needs it for their bookkeeping export.',
    customerEmail: 'finance@calderwood-retail.ie',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    createdAt: ago(1 * DAY + 2 * HOUR),
  },
  {
    title: 'Return authorisation stuck in "pending" for six days',
    description:
      'A return was approved on our side but the status in the customer portal still shows pending. They have not received the return label email either.',
    customerEmail: 'returns@northgate-plumbing.com',
    priority: 'MEDIUM',
    status: 'OPEN',
    createdAt: ago(1 * DAY + 6 * HOUR),
  },
  {
    title: 'Webhook deliveries failing with 401 after key rotation',
    description:
      'We rotated the signing secret last week. Deliveries started returning 401 immediately. We use the secret shown on the integrations page. Are the two values out of sync?',
    customerEmail: 'dev@clearwater-analytics.io',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdAt: ago(1 * DAY + 11 * HOUR),
  },
  {
    title: 'Add a second shipping address to our account',
    description:
      'We ship from two warehouses. The account settings only allow one address. Is there a way to add a second without creating a second login?',
    customerEmail: 'warehouse@stanfield-distribution.co.nz',
    priority: 'LOW',
    status: 'OPEN',
    createdAt: ago(2 * DAY),
  },
  {
    title: 'Dashboard totals do not match the invoice list',
    description:
      'The summary tiles on the dashboard total 18,420.00 but adding up the individual invoices for the same period gives 18,640.00. Possibly a rounding or discount issue.',
    customerEmail: 'ops@thornbury-mill.com',
    priority: 'MEDIUM',
    status: 'OPEN',
    createdAt: ago(2 * DAY + 4 * HOUR),
  },
  {
    title: 'Bulk price update did not apply to 300 SKUs',
    description:
      'Uploaded a spreadsheet with new prices for 312 products. Around 40 kept the old price. The affected SKUs are all in the furniture category.',
    customerEmail: 'catalog@ridgeline-homegoods.com',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    createdAt: ago(3 * DAY),
    updatedAt: ago(2 * DAY + 20 * HOUR),
  },
  {
    title: 'Users deactivated by mistake cannot be reactivated',
    description:
      'We archived three seasonal staff accounts before the season was cancelled. Reactivating them shows an error about a conflicting email address.',
    customerEmail: 'admin@harlow-provisions.com',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    createdAt: ago(3 * DAY + 5 * HOUR),
    updatedAt: ago(2 * DAY + 2 * HOUR),
  },
  {
    title: 'Print view cuts off the order notes column',
    description:
      'When printing the order detail page the notes column is truncated. On screen it looks fine. Affects the printed packing slip our warehouse uses.',
    customerEmail: 'fulfilment@silverbrook-trading.com',
    priority: 'LOW',
    status: 'RESOLVED',
    createdAt: ago(4 * DAY),
    updatedAt: ago(3 * DAY + 8 * HOUR),
  },
  {
    title: 'Password reset email never arrives',
    description:
      'Two customers on the same domain report no reset email. It is not in spam. Mail logs show the message as delivered but bounced at their provider.',
    customerEmail: 'support@cranmore-services.co.uk',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    createdAt: ago(4 * DAY + 3 * HOUR),
    updatedAt: ago(3 * DAY + 1 * HOUR),
  },
  {
    title: 'Currency shown in USD instead of configured default',
    description:
      'Store settings say default currency is GBP. Prices display in USD for everyone including UK customers, though checkout converts correctly.',
    customerEmail: 'shop@elmsworth-and-co.uk',
    priority: 'LOW',
    status: 'RESOLVED',
    createdAt: ago(5 * DAY),
    updatedAt: ago(4 * DAY + 6 * HOUR),
  },
  {
    title: 'Order #44290 shows "processing" after despatch',
    description:
      'The courier confirmed collection but the order still shows processing. The tracking number field is blank even though despatch notes were added.',
    customerEmail: 'orders@bellhaven-supplies.com',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    createdAt: ago(5 * DAY + 7 * HOUR),
  },
  {
    title: 'API rate limit reached during nightly sync',
    description:
      'Our integration pulls around 900 orders nightly. It starts failing after about 600 requests with a 429. Is there a higher limit available on our plan?',
    customerEmail: 'integrations@pennant-digital.com',
    priority: 'LOW',
    status: 'RESOLVED',
    createdAt: ago(6 * DAY),
    updatedAt: ago(5 * DAY + 2 * HOUR),
  },
  {
    title: 'Refund shows in our ledger but not on the customer statement',
    description:
      'Refund #R-9912 completed on our side. The customer says the money has not returned to their account four days later.',
    customerEmail: 'finance@quarryhill-ltd.com',
    priority: 'HIGH',
    status: 'RESOLVED',
    createdAt: ago(6 * DAY + 4 * HOUR),
    updatedAt: ago(4 * DAY + 18 * HOUR),
  },
  {
    title: 'Mobile app crashes opening the notifications tab',
    description:
      'Android 14, app version 4.2.1. Closing and reopening the app works until notifications are opened again. No crash report reaches us.',
    customerEmail: 'ops@valehaven-retail.com',
    priority: 'MEDIUM',
    status: 'OPEN',
    createdAt: ago(7 * DAY),
  },
  {
    title: 'Need a copy of the signed data processing agreement',
    description:
      'Procurement needs countersigned documentation for onboarding a new site. Could someone resend the current version of the agreement?',
    customerEmail: 'legal@marchmont-legal.com',
    priority: 'LOW',
    status: 'RESOLVED',
    createdAt: ago(7 * DAY + 6 * HOUR),
    updatedAt: ago(6 * DAY + 9 * HOUR),
  },
  {
    title: 'Two users share one login after staff restructure',
    description:
      'A departing employee was removed but the shared generic login was left active. We need a way to reassign history to a named account before deactivating it.',
    customerEmail: 'it@fieldstone-group.co.uk',
    priority: 'MEDIUM',
    status: 'OPEN',
    createdAt: ago(8 * DAY),
  },
  {
    title: 'Saved filters lost after page refresh',
    description:
      'Filters configured on the orders screen reset whenever the browser reloads. We would like a shareable link that keeps the filters applied.',
    customerEmail: 'buyer@trellis-office-supplies.com',
    priority: 'LOW',
    status: 'RESOLVED',
    createdAt: ago(8 * DAY + 4 * HOUR),
    updatedAt: ago(7 * DAY + 1 * HOUR),
  },
  {
    title: 'Tracking page shows stale courier status for 24 hours',
    description:
      'Carrier status has not refreshed since yesterday afternoon. The courier portal itself is up to date. Affects roughly 25 open deliveries.',
    customerEmail: 'logistics@ashcombe-freight.com',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    createdAt: ago(9 * DAY),
    updatedAt: ago(7 * DAY + 12 * HOUR),
  },
  {
    title: 'Unable to remove a discount code from a draft order',
    description:
      'Discount WELCOME10 is applied to a draft order and the remove button does nothing. The draft can be deleted and recreated but that loses the notes.',
    customerEmail: 'orders@brightmoor-goods.com',
    priority: 'LOW',
    status: 'RESOLVED',
    createdAt: ago(9 * DAY + 5 * HOUR),
    updatedAt: ago(8 * DAY),
  },
  {
    title: 'Address autocomplete suggests a street that does not exist',
    description:
      'Entering our postcode always suggests "Unit 4" first, which was demolished two years ago. Selecting it produces an undeliverable label.',
    customerEmail: 'warehouse@stanfield-distribution.co.nz',
    priority: 'LOW',
    status: 'RESOLVED',
    createdAt: ago(10 * DAY),
    updatedAt: ago(9 * DAY + 3 * HOUR),
  },
  {
    title: 'Invoice numbering jumped by 40 over the weekend',
    description:
      'Invoice numbers moved from INV-2041 to INV-2081 without invoices in between. We use the reference for our import file and the gaps break the loader.',
    customerEmail: 'accounts@pemberton-supplies.co.uk',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    createdAt: ago(10 * DAY + 7 * HOUR),
    updatedAt: ago(9 * DAY + 15 * HOUR),
  },
  {
    title: 'Feature request: partial shipment for multi-warehouse orders',
    description:
      'Orders picked across two warehouses can only be shipped complete. Splitting them would reduce our delivery times considerably.',
    customerEmail: 'supplychain@thistleton-foods.com',
    priority: 'LOW',
    status: 'OPEN',
    createdAt: ago(11 * DAY),
  },
  {
    title: 'Guest checkout creates duplicate customer records',
    description:
      'A customer used guest checkout twice with the same email. They now appear twice in the customer list and their order history is split.',
    customerEmail: 'support@cranmore-services.co.uk',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    createdAt: ago(12 * DAY),
    updatedAt: ago(10 * DAY + 8 * HOUR),
  },
  {
    title: 'Attachment upload fails for files over 8 MB',
    description:
      'Uploading a high resolution product photo fails silently at around 8 MB. Smaller files go through. The limit is not documented anywhere.',
    customerEmail: 'catalog@ridgeline-homegoods.com',
    priority: 'LOW',
    status: 'RESOLVED',
    createdAt: ago(13 * DAY),
    updatedAt: ago(11 * DAY + 6 * HOUR),
  },
  {
    title: 'Sandbox account still sends real confirmation emails',
    description:
      'Our test environment emails customers when an order is placed. We believe test mode should suppress outbound mail entirely.',
    customerEmail: 'dev@clearwater-analytics.io',
    priority: 'HIGH',
    status: 'RESOLVED',
    createdAt: ago(14 * DAY),
    updatedAt: ago(11 * DAY + 2 * HOUR),
  },
  {
    title: 'Cannot archive products that have open orders',
    description:
      'Products with historical orders cannot be archived, which keeps discontinued items visible in the catalogue. Is there a workaround?',
    customerEmail: 'buyer@trellis-office-supplies.com',
    priority: 'LOW',
    status: 'OPEN',
    createdAt: ago(15 * DAY),
  },
  {
    title: 'Year-end report totals differ from January figures',
    description:
      'The annual summary shows 3.2% less than the sum of monthly reports. Credits issued in December may be counted in the following period.',
    customerEmail: 'finance@calderwood-retail.ie',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    createdAt: ago(16 * DAY),
    updatedAt: ago(14 * DAY + 4 * HOUR),
  },
  {
    title: 'Escalation: production site unable to process orders',
    description:
      'Checkout returns a 500 error for roughly 90% of attempts since 14:20. Card payments are being authorised but orders are not written. Revenue impact ongoing.',
    customerEmail: 'oncall@harborline-supply.com',
    priority: 'HIGH',
    status: 'RESOLVED',
    createdAt: ago(17 * DAY),
    updatedAt: ago(17 * DAY + 2 * HOUR),
  },
  {
    title: 'Report scheduler emails stopped after daylight saving change',
    description:
      'Scheduled Monday reports stopped arriving after the clocks changed. Times in the scheduler look an hour out when compared with the team timezone.',
    customerEmail: 'ops@thornbury-mill.com',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    createdAt: ago(18 * DAY),
    updatedAt: ago(16 * DAY + 9 * HOUR),
  },
  {
    title: 'Custom fields not exported in the stocktake template',
    description:
      'Our stocktake CSV export drops the batch number and expiry date columns even though both are marked as included in exports.',
    customerEmail: 'warehouse@bellhaven-supplies.com',
    priority: 'LOW',
    status: 'RESOLVED',
    createdAt: ago(19 * DAY),
    updatedAt: ago(17 * DAY + 11 * HOUR),
  },
  {
    title: 'Contact us form sends mail to a former staff address',
    description:
      'The website contact form still routes to a personal address belonging to someone who left in January. Please repoint it to the support inbox.',
    customerEmail: 'admin@harlow-provisions.com',
    priority: 'LOW',
    status: 'RESOLVED',
    createdAt: ago(20 * DAY),
    updatedAt: ago(18 * DAY + 7 * HOUR),
  },
];

// Resets the tickets table and loads the sample support requests.
async function main() {
  await prisma.ticket.deleteMany();

  await prisma.ticket.createMany({
    data: tickets.map(({ updatedAt, ...rest }) => ({
      ...rest,
      updatedAt: updatedAt ?? rest.createdAt,
    })),
  });

  const total = await prisma.ticket.count();
  console.log(`Seeded ${total} tickets.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });