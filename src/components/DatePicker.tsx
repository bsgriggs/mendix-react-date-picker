import { ReactElement, createElement, useCallback, useRef, ReactNode, useMemo, useEffect } from "react";
import DatePicker from "react-datepicker";
import { WebIcon } from "mendix";
import { Icon } from "mendix/components/web/Icon";
import "react-datepicker/dist/react-datepicker.css";
import classNames from "classnames";
import {
    IntervalDaysModeEnum,
    SpecificDaysModeEnum,
    SelectionTypeEnum,
    SpecificTimesModeEnum,
    AlignmentEnum,
    DateFormatEnum
} from "typings/ReactDatePickerProps";
import ContainsTime from "../utils/ContainsTime";
import MaskedInput from "react-text-mask";
import MapMask from "../utils/MapMask";
import TimeMatch from "../utils/TimeMatch";
import ExtractTimeFormat from "../utils/ExtractTimeFormat";
import DayOfWeekSelectable from "../utils/DayOfWeekSelectable";
import RemoveTime from "../utils/RemoveTime";
import CustomHeader from "./CustomHeader";

interface DatePickerProps {
    // System
    id: string;
    tabIndex: number;
    open: boolean;
    setOpen: (newOpen: boolean) => void;
    // General
    placeholder: string;
    dateFormatEnum: DateFormatEnum;
    timeInterval: number;
    timeCaption: string;
    selectionType: SelectionTypeEnum;
    date: Date | null;
    setDate: (newDate: Date | [Date | null, Date | null] | null) => void;
    startDate: Date | null;
    endDate: Date | null;
    readonly: boolean;
    // Selectable Dates
    minDate: Date | undefined;
    maxDate: Date | undefined;
    specificDaysMode: SpecificDaysModeEnum;
    specificDays: Date[];
    intervalDaysMode: IntervalDaysModeEnum;
    intervalDays: Array<{ start: Date; end: Date }>;
    disableSunday: boolean;
    disableMonday: boolean;
    disableTuesday: boolean;
    disableWednesday: boolean;
    disableThursday: boolean;
    disableFriday: boolean;
    disableSaturday: boolean;
    // Selectable Times
    minTime: Date | undefined;
    maxTime: Date | undefined;
    specificTimesMode: SpecificTimesModeEnum;
    specificTimes: Date[];
    // Customization
    showIcon: boolean;
    showIconInside: boolean;
    icon: WebIcon;
    showTodayButton: boolean;
    todayButtonText: string;
    monthsToDisplay: number;
    showWeekNumbers: boolean;
    showPreviousMonths: boolean;
    showArrow: boolean;
    showInline: boolean;
    alignment: AlignmentEnum;
    customChildren: ReactNode | undefined;
    clearable: boolean;
    openToDate: Date | undefined;
    maskInput: boolean;
    // Accessibility
    required: boolean;
    calendarIconLabel: string;
    navigateButtonPrefix: string;
    selectPrefix: string;
    weekPrefix: string;
    monthPrefix: string;
    monthSelectLabel: string;
    yearSelectLabel: string;
    disabledLabel: string;
    clearButtonLabel: string;
    // MxDate Meta Data
    invalid: boolean;
    firstDayOfWeek: number;
    dateFormat: string; // text format (i.e. MM/dd/yyyy)
    language: string;
}

const DatePickerComp = (props: DatePickerProps): ReactElement => {
    const ref = useRef<HTMLDivElement>(null);
    const toggleBtnRef = useRef<HTMLButtonElement>(null);
    const firstBtnRef = useRef<HTMLButtonElement>(null);

    const showTimeSelect = useMemo(
        () =>
            props.dateFormatEnum === "TIME" ||
            props.dateFormatEnum === "DATETIME" ||
            (props.dateFormatEnum === "CUSTOM" && ContainsTime(props.dateFormat)),
        [props.dateFormatEnum, props.dateFormat]
    );

    const focusInput = useCallback(() => {
        setTimeout(
            () => (!props.showInline ? (document.getElementById(props.id) as HTMLInputElement)?.focus() : undefined),
            100
        );
    }, [props.id, props.showInline]);

    const focusFirstBtn = useCallback(() => {
        setTimeout(() => {
            firstBtnRef.current?.focus();
        }, 100);
    }, [firstBtnRef]);

    const handleOnChange = useCallback(
        (date: Date | [Date | null, Date | null] | null) => {
            if (props.selectionType === "SINGLE") {
                if (
                    (props.dateFormatEnum !== "DATETIME" && props.dateFormatEnum !== "CUSTOM") ||
                    (showTimeSelect &&
                        date !== null &&
                        props.date !== null &&
                        !Array.isArray(date) &&
                        !TimeMatch(date, props.date))
                ) {
                    // if not date & time picker, close the popper
                    // if date & time picker, close the popper when the time is selected
                    props.setOpen(false);
                    focusInput();
                }
            } else if (props.startDate !== null) {
                // if multi, close the popper when the end date is selected
                props.setOpen(false);
                focusInput();
            }
            props.setDate(date);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.date, props.startDate, showTimeSelect, focusInput, props.setDate]
    );

    //A11y fixes
    useEffect(() => {
        if (props.date || props.startDate || props.endDate) {
            setTimeout(() => {
                // make the clear button focus-able
                const clearButton = ref.current?.querySelector(".react-datepicker__close-icon");
                clearButton?.setAttribute("tabIndex", `${props.tabIndex}`);
                // make the clear button's aria label match the title
                clearButton?.setAttribute("aria-label", `${props.clearButtonLabel}`);
            }, 100);
        }
    }, [props.date, props.startDate, props.endDate, ref.current, props.tabIndex]);

    return (
        <div
            className={classNames(
                "mendix-react-datepicker",
                { "icon-inside": props.showIconInside },
                { "date-and-time": showTimeSelect && props.dateFormatEnum !== "TIME" }
            )}
            ref={ref}
            onKeyDown={event => {
                if (event.key === "Tab") {
                    setTimeout(() => {
                        if (ref.current && !ref.current.contains(document.activeElement)) {
                            props.setOpen(false);
                        }
                    }, 100);
                }
            }}
        >
            <DatePicker
                id={props.id}
                tabIndex={props.tabIndex}
                allowSameDay={false}
                ariaLabelledBy={`${props.id}-label`}
                autoFocus={false}
                calendarStartDay={props.firstDayOfWeek}
                className="form-control"
                dateFormat={props.dateFormat}
                timeFormat={showTimeSelect ? ExtractTimeFormat(props.dateFormat) : undefined}
                disabled={props.readonly}
                disabledKeyboardNavigation={false}
                dropdownMode="select"
                locale={props.language}
                onChange={handleOnChange}
                placeholderText={props.placeholder}
                popperPlacement={
                    props.alignment === "LEFT" ? "bottom-start" : props.alignment === "RIGHT" ? "bottom-end" : "auto"
                }
                popperProps={{
                    strategy: "fixed"
                }}
                popperModifiers={[
                    {
                        name: "offset",
                        options: {
                            offset: [0, 0]
                        }
                    }
                ]}
                readOnly={props.readonly}
                selectsRange={props.selectionType === "MULTI"}
                startDate={props.startDate ? props.startDate : undefined}
                endDate={props.endDate ? props.endDate : undefined}
                selected={props.date}
                showPopperArrow={props.showArrow}
                strictParsing
                useWeekdaysShort={false}
                minDate={props.minDate}
                maxDate={props.maxDate}
                minTime={props.minTime}
                maxTime={props.maxTime}
                includeDates={props.specificDaysMode === "INCLUDE" ? props.specificDays : undefined}
                excludeDates={props.specificDaysMode === "EXCLUDE" ? props.specificDays : undefined}
                includeTimes={props.specificTimesMode === "INCLUDE" ? props.specificTimes : undefined}
                excludeTimes={props.specificTimesMode === "EXCLUDE" ? props.specificTimes : undefined}
                includeDateIntervals={props.intervalDaysMode === "INCLUDE" ? props.intervalDays : undefined}
                excludeDateIntervals={props.intervalDaysMode === "EXCLUDE" ? props.intervalDays : undefined}
                filterDate={date =>
                    DayOfWeekSelectable(
                        date,
                        props.disableSunday,
                        props.disableMonday,
                        props.disableTuesday,
                        props.disableWednesday,
                        props.disableThursday,
                        props.disableFriday,
                        props.disableSunday
                    )
                }
                open={props.open}
                onInputClick={() => props.setOpen(true)}
                onClickOutside={event => {
                    if (toggleBtnRef.current?.contains(event.target as Node)) {
                        return;
                    }
                    props.setOpen(false);
                }}
                onKeyDown={event => {
                    switch (event.key) {
                        case " ":
                            if (!props.open) {
                                event.preventDefault();
                                props.setOpen(true);
                                focusFirstBtn();
                            }
                            break;
                        case "Escape":
                            props.setOpen(false);
                            focusInput();
                            break;
                    }
                }}
                isClearable={props.clearable}
                monthsShown={props.monthsToDisplay}
                showWeekNumbers={props.showWeekNumbers}
                showPreviousMonths={props.showPreviousMonths}
                inline={props.showInline}
                showMonthYearPicker={props.dateFormatEnum === "MONTH"}
                showQuarterYearPicker={props.dateFormatEnum === "QUARTER"}
                showYearPicker={props.dateFormatEnum === "YEAR"}
                showTimeSelect={showTimeSelect}
                showTimeSelectOnly={props.dateFormatEnum === "TIME"}
                timeIntervals={props.timeInterval}
                timeCaption={props.timeCaption}
                openToDate={props.openToDate}
                autoComplete="off"
                customInput={
                    props.maskInput ? (
                        <MaskedInput
                            mask={MapMask(props.dateFormat)}
                            keepCharPositions
                            guide
                            placeholder={props.placeholder}
                        />
                    ) : undefined
                }
                renderCustomHeader={params => (
                    <CustomHeader {...props} ref={firstBtnRef} {...params} focusInput={focusInput} />
                )}
                ariaInvalid={props.invalid ? "true" : "false"}
                ariaRequired={props.required ? "true" : "false"}
                chooseDayAriaLabelPrefix={props.selectPrefix}
                monthAriaLabelPrefix={props.monthPrefix}
                weekAriaLabelPrefix={props.weekPrefix}
                disabledDayAriaLabelPrefix={props.disabledLabel}
                clearButtonTitle={props.clearButtonLabel}
            >
                {props.showTodayButton && (
                    <button
                        className="btn btn-default btn-block today-button"
                        aria-label={props.selectPrefix + " " + props.todayButtonText}
                        tabIndex={props.tabIndex}
                        onClick={() => handleOnChange(RemoveTime(new Date()))}
                    >
                        {props.todayButtonText}
                    </button>
                )}
                {props.customChildren}
            </DatePicker>
            {!props.showInline && props.showIcon && (
                <button
                    title={props.calendarIconLabel}
                    aria-label={props.calendarIconLabel}
                    aria-controls={props.id}
                    aria-haspopup
                    ref={toggleBtnRef}
                    className="btn btn-default btn-calendar spacing-outer-left"
                    onClick={() => {
                        if (props.open) {
                            setTimeout(() => toggleBtnRef.current?.focus(), 100);
                        } else {
                            focusFirstBtn();
                        }
                        props.setOpen(!props.open);
                    }}
                    tabIndex={!props.showIconInside ? props.tabIndex : -1}
                >
                    {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment 
                    @ts-ignore */}
                    <Icon icon={props.icon} />
                </button>
            )}
        </div>
    );
};

export default DatePickerComp;
