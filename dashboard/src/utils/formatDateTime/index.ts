const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
})

export default function formatDateTime(value: string | Date) {
    return dateTimeFormatter.format(new Date(value))
}
