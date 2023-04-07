import { zodResolver } from '@hookform/resolvers/zod';
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { HiPencil, HiUpload as IcUpload } from 'react-icons/hi';
import TopBarProgress from "react-topbar-progress-indicator";
import { z } from 'zod';
import IconButton from "../../../components/buttons/IconButton";
import PageCard from "../../../components/card/Card";
import { FormFieldError, FormFieldWrapper } from '../../../components/error-messages/FormError';
import { AppRoutes } from "../../../config/appRoutes";
import { UserRoles } from "../../../interface/auth.interface";
import classNames from '../../../utils/classnames';
import getClientIp from "../../../utils/getClientIp";
import { notifyError, notifySuccessBR } from '../../../utils/notifications';
import { trpc } from '../../../utils/trpc';

const ApiKeys = () => {
    return (
        <div className='auth-container'>
            <Head>
                <title>Affitime | API Keyleri</title>
            </Head>

            <main className="mx-auto container min-h-screen px-2 pt-6">

                <div className="mb-2">
                    <h1 className="text-slate-600 font-bold text-2xl">
                        API Anahtarları
                    </h1>
                    <small className="text-slate-400 text-sm">
                        Mağaza entegrasyonu için API anahtarlarını yönetin.
                    </small>
                </div>

                <PageCard>

 
                </PageCard>

            </main>

        </div>
    )
}

export default ApiKeys