import { defineAuth } from '@aws-amplify/backend';

/**
 * Email + password sign-in for the salon owner only.
 * Self sign-up is turned off in backend.ts (admin-created users only); the
 * owner account is created by hand in Cognito and added to the OWNER group.
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  groups: ['OWNER'],
  // Password reset codes go to the verified email.
  accountRecovery: 'EMAIL_ONLY',
});
