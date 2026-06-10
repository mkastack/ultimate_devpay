/**
 * Sentry Error Testing Component
 * Use this component to test Sentry error tracking in development
 */

import { Button } from "@/components/ui/button";
import * as Sentry from "@sentry/react";

export function SentryErrorTest() {
  const handleThrowError = () => {
    try {
      throw new Error("This is a test error from Sentry error tracking!");
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  return (
    <Button onClick={handleThrowError} variant="destructive" size="sm">
      🔥 Test Sentry Error
    </Button>
  );
}

export default SentryErrorTest;
