import { acceptDonationTransaction, createDonation, getDonationById } from '../src/services/donationService';
import { UserProfile } from '../src/types';

/**
 * MANDATORY SINGLE-NGO ACCEPTANCE CONCURRENCY TEST
 * 
 * Simulates two NGO users attempting to accept the exact same AVAILABLE donation concurrently.
 */
export async function runSingleNgoConcurrencyTest() {
  console.log('--- STARTING CONCURRENCY TEST: SINGLE-NGO ATOMIC ACCEPTANCE ---');

  // 1. Create a dummy donor profile & donation
  const donorUser: UserProfile = {
    uid: 'donor_test_01',
    name: 'Test Donor Banquet',
    email: 'testdonor@communityfood.org',
    phone: '+1 (555) 999-8888',
    role: 'DONOR',
    location: 'Test Convention Hall',
    isBlocked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const donation = await createDonation(
    {
      donorId: donorUser.uid,
      donorName: donorUser.name,
      donorPhone: donorUser.phone,
      donorLocation: donorUser.location,
      foodName: 'Concurrency Test Surplus Buffet',
      quantity: 100,
      unit: 'meals',
      foodType: 'VEGETARIAN',
      preparedAt: new Date().toISOString(),
      pickupDeadline: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
      pickupLocation: 'Loading Dock A',
      description: 'Test batch for atomic lock validation',
      safetyConfirmed: true,
    },
    donorUser
  );

  console.log(`[1] Created Test Donation: ID = ${donation.id}, Status = ${donation.status}`);

  // 2. Define two distinct NGO identities
  const ngoA: UserProfile = {
    uid: 'ngo_alpha_01',
    name: 'NGO Alpha Representative',
    email: 'ngo_alpha@communityfood.org',
    phone: '+1 (555) 111-2222',
    role: 'NGO',
    organizationName: 'Alpha Food Rescue',
    location: 'North Zone',
    isBlocked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const ngoB: UserProfile = {
    uid: 'ngo_beta_02',
    name: 'NGO Beta Representative',
    email: 'ngo_beta@communityfood.org',
    phone: '+1 (555) 333-4444',
    role: 'NGO',
    organizationName: 'Beta Hope Foundation',
    location: 'South Zone',
    isBlocked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 3. Fire concurrent acceptance transactions
  console.log('[2] Triggering simultaneous acceptDonationTransaction calls for NGO A and NGO B...');

  const results = await Promise.allSettled([
    acceptDonationTransaction(donation.id, ngoA),
    acceptDonationTransaction(donation.id, ngoB),
  ]);

  const fulfilled = results.filter((r) => r.status === 'fulfilled');
  const rejected = results.filter((r) => r.status === 'rejected');

  console.log(`[3] Results: Fulfilled = ${fulfilled.length}, Rejected = ${rejected.length}`);

  // 4. Assert correctness
  if (fulfilled.length !== 1 || rejected.length !== 1) {
    throw new Error(
      `CONCURRENCY FAILURE: Expected exactly 1 successful claim and 1 rejection. Got ${fulfilled.length} successes and ${rejected.length} rejections.`
    );
  }

  const rejectedReason = (rejected[0] as PromiseRejectedResult).reason.message;
  console.log(`[4] Rejection Reason: "${rejectedReason}"`);

  if (!rejectedReason.includes('already been accepted')) {
    throw new Error(`CONCURRENCY FAILURE: Unexpected rejection message: ${rejectedReason}`);
  }

  const updatedDonation = await getDonationById(donation.id);
  console.log(`[5] Final Document State: status = ${updatedDonation?.status}, acceptedBy = ${updatedDonation?.acceptedBy}`);

  if (updatedDonation?.status !== 'ACCEPTED') {
    throw new Error(`CONCURRENCY FAILURE: Final status is not ACCEPTED`);
  }

  console.log('--- CONCURRENCY TEST PASSED PERFECTLY: 1 SUCCESS, 1 REJECTED ---');
  return true;
}
