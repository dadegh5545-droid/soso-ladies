import type { GetServerSideProps } from 'next';
import outputs from '@/amplify_outputs.json';

const LAST_AUTH_USER = `CognitoIdentityServiceProvider.${outputs.auth.user_pool_client_id}.LastAuthUser`;

/**
 * Sends a browser without an Amplify session cookie to /admin/login before
 * any admin page renders. This only checks that a session cookie exists; the
 * page then verifies the session and the OWNER group, and the backend checks
 * the token on every call.
 */
export const requireSessionCookie: GetServerSideProps = async ({ req, res }) => {
  res.setHeader('Cache-Control', 'private, no-store');
  if (!req.cookies[LAST_AUTH_USER]) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }
  return { props: {} };
};
