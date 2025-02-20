import { useState } from "react";
import styles from "./EventCreate.module.scss";
import { useMutation } from "@tanstack/react-query";
import { EventService } from "@/services/event.service";
import PopUpWrapper from "@/components/ui/PopUpWrapper/PopUpWrapper";

const EventForm = ({graphId, isOpen, onClose}: any) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [timeFrom, setTimeFrom] = useState("");
    const [timeTo, setTimeTo] = useState("");

    const { mutate, isPending, isSuccess, isError } = useMutation({
        mutationFn: () => EventService.createEvent({ graphId, name, description, eventDate, timeFrom, timeTo }),
        onSuccess: () => {
            setName("");
            setDescription("");
            setEventDate("");
            setTimeFrom("");
            setTimeTo("");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutate();
    };

    return (
        <PopUpWrapper onClose={onClose} isOpen={isOpen} width={550} height={450}>
            <div className={styles.formContainer}>
                <form className={styles.form} onSubmit={handleSubmit}>

                    <label>Название мероприятия</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

                    <label>Описание мероприятия</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
                    <span className={styles.countLetters}>Количество символов - {description.length} / 150</span>

                    <label>Дата</label>
                    <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />

                    <div className={styles.timeContainer}>
                        <div>
                            <label>Время начала</label>
                            <input type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} required />
                        </div>
                        <div>
                            <label>Время окончания</label>
                            <input type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} required />
                        </div>
                    </div>

                    <button type="submit" disabled={isPending}>
                        {isPending ? "Создание..." : "Создать мероприятие"}
                    </button>

                    {isSuccess && <p className={styles.success}>Мероприятие создано!</p>}
                    {isError && <p className={styles.error}>Ошибка при создании</p>}
                </form>
        
            </div>
        </PopUpWrapper>
    );
};

export default EventForm;
