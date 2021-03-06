// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as React from "react";

import { Translator } from "readium-desktop/common/services/translator";

import { container } from "readium-desktop/renderer/di";

export interface TranslatorProps {
    __?: any;
    translator?: Translator;
}

export function withTranslator(WrappedComponent: any) {
    const WrapperComponent = class extends React.Component<any, undefined> {
        public render() {
            const translator = container.get("translator") as Translator;
            const translate = translator.translate.bind(translator);

            const newProps: any = Object.assign(
                {},
                this.props,
                {
                    __: translate,
                    translator,
                },
            );
            return (<WrappedComponent { ...newProps } />);
        }
    };

    return WrapperComponent;
}
