'use client'

import { useEffect, useRef } from 'react'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { Form, Formik, type FormikProps } from 'formik'
import { LoaderCircle, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { IGeneratePostData } from '@/modules/jobs/interfaces/IGeneratePostData'
import { useGeneratePostMutation } from '@/modules/jobs/queries/jobsMutations'
import { generateFormInitialValues, generateFormSchema } from './form'

export default function GenerateForm() {

    const { mutate: generatePost, reset: resetMutation, isPending, isSuccess } = useGeneratePostMutation()
    
    const formikRef = useRef<FormikProps<IGeneratePostData>>(null)
    
    const router = useRouter()

    const isSending = isPending || isSuccess

    useEffect(() => {
        if (!isSuccess) return

        const formik = formikRef.current

        return () => {
            resetMutation()
            formik?.resetForm()
        }
    }, [isSuccess, resetMutation])

    const handleSubmit = (values: IGeneratePostData) => {
        generatePost(
            { url: values.url.trim() },
            { onSuccess: (job) => router.push(`/jobs/${job.id}`) }
        )
    }

    return (

        <>
            <Card>
                <CardHeader>
                    <CardTitle>Gerar a partir de uma URL</CardTitle>
                    <CardDescription>
                        Cole o link de uma matéria jornalística. Se ela já tiver sido enviada, você vai direto para o andamento dela.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Formik
                        innerRef={formikRef}
                        initialValues={generateFormInitialValues}
                        validationSchema={generateFormSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ values, errors, touched, handleChange, handleBlur }) => {

                            const urlError = touched.url ? errors.url : undefined

                            return (
                                <Form
                                    noValidate
                                    className={clsx('flex flex-col gap-4 sm:flex-row sm:items-start')}
                                >
                                    <Field
                                        data-invalid={!!urlError}
                                        className={clsx('flex-1')}
                                    >
                                        <FieldLabel
                                            htmlFor='url'
                                            className={clsx('sr-only')}
                                        >
                                            URL da matéria
                                        </FieldLabel>
                                        <Input
                                            id='url'
                                            name='url'
                                            type='url'
                                            inputMode='url'
                                            placeholder='https://g1.globo.com/...'
                                            autoComplete='off'
                                            autoFocus
                                            value={values.url}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            disabled={isSending}
                                            aria-invalid={!!urlError}
                                        />
                                        {urlError && (
                                            <FieldError>{urlError}</FieldError>
                                        ) || (
                                            <FieldDescription>A geração leva alguns segundos e é feita em segundo plano.</FieldDescription>
                                        )}
                                    </Field>

                                    <Button
                                        type='submit'
                                        disabled={isSending}
                                    >
                                        {isSending && (
                                            <LoaderCircle className={clsx('animate-spin')} />
                                        ) || (
                                            <Sparkles />
                                        )}
                                        Gerar matéria
                                    </Button>
                                </Form>
                            )
                        }}
                    </Formik>
                </CardContent>
            </Card>
        </>

    )

}
