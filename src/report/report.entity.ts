import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Report {
    @PrimaryGeneratedColumn()
    id: number
    @Column()
    serviceUrl: string
    @Column({ default: true })
    status: string
    @BeforeInsert()
    beforeInsertActions() {
        this.status = 'pending...'
    }
    @Column({ nullable: true })
    fileUrl: string

}