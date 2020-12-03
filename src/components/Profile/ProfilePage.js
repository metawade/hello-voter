import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import { AppContext } from "../../api/AppContext";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import PageLayout from "../PageLayout";
import { ResponsiveContainer } from '../pageStyles';
import { ProfileForm } from "./ProfileForm";

export const DeniedPage = () => (
  <PageLayout title="Thanks for being a BlockPower Ambassador!">
    <p>
    Thanks for being a BlockPower Ambassador! With your help, we have reached over 100,000 low-propensity Black voters so they can make their voices heard at the ballot box. 
    </p>

    <p>
    Most of you should have received payment for your confirmed Triplers or heard from us about connecting to a bank account so outstanding payments can be processed. Some accounts are under review for potentially providing false information; those confirmed to have done that will not be paid out.
    </p>

    <p>
    We are now focused on get-out-the-vote efforts, so you will not be able to access the BlockPower app.  Please continue to help by reaching out to your Triplers and asking them to encourage their Triplees to vote. 
    </p>

    <p>
    We're grateful you joined us in making this model a success. You've been patient as we've made upgrades and have spread the word about BlockPower. We will build on your efforts and ideas to make BlockPower better and more responsive in the future.  Thanks again. 
    </p>

    <p>
    Onward!<br/>
    The BlockPower Team
    </p>
  </PageLayout>
);

export const NoNewSignupsPage = () => (
  <PageLayout title='This site is now closed to new Voting Ambassador sign-ups'>
    <ResponsiveContainer>
      <p>
        If you are trying to access an existing account, please contact
        support@blockpower.vote. To sign up for a new Voting Ambassador
        account, please go to <a href='https://app.blockpower.vote/ambassadors'>https://app.blockpower.vote/ambassadors</a>
      </p>
    </ResponsiveContainer>
  </PageLayout>
);

export const ProfilePage = () => {
  const [err, setErr] = useState(false);
  const history = useHistory();
  const { api, fetchUser, user } = React.useContext(
    AppContext
  );
  const saveProfile = async (ambassador) => {
    const { error } = await api.saveProfile(ambassador);
    if (error) return setErr(error.msg);  // returns undefined
    const { userError } = await fetchUser();
    if (userError) return setErr(userError.msg);  // returns undefined
    return true;
  }

  if (process.env.REACT_APP_NO_NEW_SIGNUPS) return <NoNewSignupsPage />;
  if (user?.msg === "Your account is locked.") return <DeniedPage/>;

  return <PageLayout title="Edit Your Profile">
    <ProfileForm
      ambassador={user}
      setAmbassador={async (mergeData) => {
        const newAmbassador = mergeData(user);
        const success = await saveProfile(newAmbassador);
        if (success) history.push("/");
      }}
      disablePhone
      disableEmail
      err={err}
    />
  </PageLayout>;
}

export const SignupPage = () => {
  const [err, setErr] = useState(false);
  const history = useHistory();
  const { ambassador, setAmbassador, api, fetchUser, user } = React.useContext(
    AppContext
  );
  const [signupPrefill, setSignupPrefill] = useLocalStorage("signup_prefill", {});

  useEffect(() => {
    const signup = async () => {
      const { error } = await api.signup(ambassador);
      if (error) return setErr(error.msg);  // returns undefined
      const { userError } = await fetchUser();
      if (userError) return setErr(userError.msg);  // returns undefined
      setSignupPrefill({});  // clean up upon successful signup
    };
    if (ambassador.form_submitted) {
      signup();
    }
  }, [ambassador]);

  if (process.env.REACT_APP_NO_NEW_SIGNUPS) return <NoNewSignupsPage />;
  if (user?.msg === "Your account is locked.") return <DeniedPage/>;
  if (user?.signup_completed) {
    history.push("/");  // let the router decide where to go
    return null;
  }

  return <PageLayout title="Please Enter Your Details">
    <ProfileForm
      ambassador={{...ambassador, ...signupPrefill}}
      setAmbassador={setAmbassador}
      err={err}
    />
  </PageLayout>;
};