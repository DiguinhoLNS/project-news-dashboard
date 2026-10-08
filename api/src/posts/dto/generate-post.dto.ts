import { IsUrl, MaxLength } from 'class-validator'

export class GeneratePostDto {
    /**
     * URL pública da matéria que será reescrita
     */
    @IsUrl(
        { protocols: ['http', 'https'], require_protocol: true },
        { message: 'url deve ser um endereço http ou https válido' },
    )
    @MaxLength(2048)
    url: string
}
