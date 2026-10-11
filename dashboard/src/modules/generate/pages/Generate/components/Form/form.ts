import * as yup from 'yup'
import type { IGeneratePostData } from '@/modules/jobs/interfaces/IGeneratePostData'

export const generateFormInitialValues: IGeneratePostData = {
    url: ''
}

export const generateFormSchema = yup.object({
    url: yup
        .string()
        .trim()
        .required('Informe a URL da matéria')
        .url('Informe uma URL válida, começando com http:// ou https://')
        .max(2048, 'A URL pode ter no máximo 2048 caracteres')
})
