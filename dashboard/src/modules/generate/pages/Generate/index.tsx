import PageHeader from '@/components/page/PageHeader'
import GenerateForm from './components/Form'
import GenerateHowItWorks from './components/HowItWorks'

export default function Generate() {

    return (

        <>
            <PageHeader
                title='Nova matéria'
                description='Envie a URL de uma notícia: a IA reescreve o conteúdo e publica no WordPress.'
            />

            <GenerateForm />
            <GenerateHowItWorks />
        </>

    )

}
