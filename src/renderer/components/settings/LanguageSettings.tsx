// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as React from "react";

import * as styles from "readium-desktop/renderer/assets/styles/settings.css";

import { AvailableLanguages } from "readium-desktop/common/services/translator";

import { connect } from "react-redux";

import LibraryLayout from "readium-desktop/renderer/components/layout/LibraryLayout";

import Header from "./Header";

import { setLocale } from "readium-desktop/common/redux/actions/i18n";

import { TranslatorProps, withTranslator } from "readium-desktop/renderer/components/utils/translator";

import * as DoneIcon from "readium-desktop/renderer/assets/icons/done.svg";
import SVG from "../utils/SVG";

interface Props extends TranslatorProps {
    locale: string;
    setLocale: (locale: string) => void;
}

interface States {
    placeholder: any;
}

export class LanguageSettings extends React.Component<Props, States> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            placeholder: undefined,
        };
    }

    public render(): React.ReactElement<{}> {
        const secondaryHeader = <Header section={2}/>;
        const { __ } = this.props;
        return (
            <>
                <LibraryLayout title={__("header.settings")}>
                    <div className={styles.section_title}>{ __("settings.language.languageChoice")}</div>
                    <form className={styles.languages_list}>
                            { Object.keys(AvailableLanguages).map((lang: string, i: number) =>
                                <div key={i}>
                                    <input
                                        id={"radio-" + lang}
                                        type="radio"
                                        lang={lang}
                                        name="language"
                                        onChange={() => this.props.setLocale(lang)}
                                        checked={this.props.locale === lang}
                                    />
                                    <label htmlFor={"radio-" + lang}>
                                        { this.props.locale === lang && <SVG svg={DoneIcon} ariaHidden/>}
                                        { (AvailableLanguages as any)[lang] }
                                    </label>
                                </div>,
                            )}
                    </form>
                </LibraryLayout>
            </>
        );
    }
}

const mapStateToProps = (state: any) => {
    return {
        locale: state.i18n.locale,
    };
};

const mapDispatchToProps = (dispatch: any) => {
    return {
        setLocale: (locale: string) => dispatch(setLocale(locale)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslator(LanguageSettings));
