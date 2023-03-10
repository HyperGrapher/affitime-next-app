/* eslint-disable react/jsx-no-target-blank */
import Styles from './Styles'
import { Form, Field } from 'react-final-form'
import Card from './Card'
import {
    formatCreditCardNumber,
    formatCVC,
    formatExpirationDate
} from './card.utils';
import styled from '@emotion/styled';
import { Container, Stack, Typography, TextField, Box } from '@mui/material';
import { useEffect, useState } from "react";


const sleep = (ms: number | undefined) => new Promise(resolve => setTimeout(resolve, ms))

const onSubmit = async () => {
    await sleep(300);
}


const CardMainComp = () => {
    return (
        <Styles>

            <Form
                onSubmit={onSubmit}
                render={({
                    handleSubmit,
                    form,
                    submitting,
                    pristine,
                    values,
                    active
                }) => {
                    return (
                        <form onSubmit={handleSubmit}>
                            <Card
                                number={values.number || ''}
                                name={values.name || ''}
                                expiry={values.expiry || ''}
                                cvc={values.cvc || ''}
                                focused={active}
                            />
                            <div>
                                <Field
                                    name="number"
                                    component="input"
                                    type="text"
                                    inputmode="numeric"
                                    pattern="[\d| ]{16,22}"
                                    placeholder="Kart Numarası"
                                    format={formatCreditCardNumber}
                                />
                            </div>
                            <div>
                                <Field
                                    name="name"
                                    component="input"
                                    type="text"
                                    placeholder="Name"
                                />
                            </div>
                            <div>
                                <Field
                                    name="expiry"
                                    component="input"
                                    type="text"
                                    pattern="\d\d/\d\d"
                                    placeholder="Tarih"
                                    format={formatExpirationDate}
                                />
                                <Field
                                    name="cvc"
                                    component="input"
                                    type="text"
                                    pattern="\d{3,4}"
                                    placeholder="CVC"
                                    format={formatCVC}
                                />
                            </div>
                            <div className="buttons">
                                <button type="submit" disabled={submitting}>
                                    Ödeme Yap
                                </button>

                            </div>
                        </form>
                    )
                }}
            />
        </Styles>
    )
}

export default CardMainComp