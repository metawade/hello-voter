import React, { useState } from "react";
import styled from "styled-components";
import { ResponsiveContainer } from "../pageStyles";
import { spacing } from "../../theme";
import PageLayout from "../PageLayout";
import Breadcrumbs from "../Breadcrumbs";
import Button from "../Button";
import paypalFull from "../../assets/images/paypal-full.svg";
import { Form, InlineNotification, TextInput } from 'carbon-components-react';
import { useHistory } from 'react-router-dom';
import { AppContext } from '../../api/AppContext';

const Image = styled.img`
  width: 100%;
  max-width: 200px;
`;

const Subheader = styled.h4`
  font-weight: 600;
  margin-top: ${spacing[5]};
  margin-bottom: ${spacing[4]};
`;

const Prompt = styled.p`
  margin-bottom: ${spacing[5]};
`;

export default () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);
  const { user, api, fetchUser } = React.useContext(AppContext);

  const setPayPalAccount = async (email) => {
    setLoading(true);
    const { error, data } = await api.setPayPalAccount(email);
    await fetchUser();
    setLoading(false);
    return {
      error,
      data,
    };
  };

  const submit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { error } = await setPayPalAccount(formData.get("email"));
    if (error) return setErr(error.msg);
    history.push("/payments");
  };

  if (!user.paypal_approved) {
    // Reject users that don't have the paypal_approved flag.
    history.push("/payments");
    return null;
  }

  return (
    <PageLayout
      title={""}
      header={
        <Breadcrumbs
          items={[
            { name: "Home", route: "/home" },
            { name: "Payments", route: "/payments" },
            { name: "Add", route: "/payments/add" },
            { name: "PayPal" },
          ]}
        />
      }
    >
      <ResponsiveContainer>
        <Image src={paypalFull} />
        <Subheader>Setting up PayPal for Payments</Subheader>
        <Prompt>
          If you already have a PayPal account, please confirm the email address you use for your
          PayPal account below.
        </Prompt>
        <Prompt>
          If you don't have a PayPal account, you will need to set up a PayPal account when you are
          ready to claim your payments. Please enter the email address where you would like to receive
          PayPal payments below.
        </Prompt>
        <Form onSubmit={submit}>
          <TextInput
            defaultValue={user && user.email}
            id="email"
            name="email"
            invalidText="Invalid email."
            labelText="Email address*"
            required
          />
          {err && (
            <InlineNotification
              kind="error"
              icondescription="Dismiss notification"
              subtitle={err}
              title=""
            />
          )}
          <Button
            type="submit"
            style={{ backgroundColor: "#25C87D" }}
            loading={loading}
            // TODO: Copied from ChimePage. Why is this commented out?
            // trackingEvent={{ action: "SubmitTriplerConfirm", label: "Add" }}
            isAForm
          >
            Confirm
          </Button>
        </Form>
      </ResponsiveContainer>
    </PageLayout>
  );
};
