import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { Password } from "@convex-dev/auth/providers/Password";
import { emailOtp } from "./auth/emailOtp";


export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile: (params) => {
        const profile: Record<string, string> = {
          email: params.email as string,
        };
        if (params.name) {
          profile.name = params.name as string;
        }
        return profile as any;
      },
    }),
    emailOtp,
    Anonymous,
  ],
});
