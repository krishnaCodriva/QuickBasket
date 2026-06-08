import { createContext, useEffect, useReducer, useState } from "react";
import i18n, { getActive } from "../../localization/i18";

const initalValue = {
    lange: "en"
}

const reducer = (state: any, action: any) => {
    console.log("action : ", action)
    switch (action.type) {
        case "SET_LANG":
            return { ...state, lange: action?.payload }
        default:
            return state
    }
}

export const LocalizationContext = createContext(initalValue)

export const LocalizationContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [initLang, initialDispatch] = useReducer(reducer, initalValue)

    useEffect(() => {
        getActive(initLang.lange)
    }, [initLang])

    return (
        <LocalizationContext.Provider value={[initLang, initialDispatch]}>
            {children}
        </LocalizationContext.Provider>
    )
}

export default LocalizationContext;

