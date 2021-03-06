// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as uuid from "uuid";

import { Action } from "readium-desktop/common/models/redux";

import { readerActions } from "readium-desktop/common/redux/actions";
import { ReaderState } from "readium-desktop/renderer/redux/states/reader";

import { ReaderMode } from "readium-desktop/common/models/reader";

const initialState: ReaderState = {
    reader: undefined,
    mode: ReaderMode.Attached,
    config: {
        align: "left",
        colCount: "auto",
        dark: false,
        font: "DEFAULT",
        fontSize: "100%",
        invert: false,
        lineHeight: "1.5",
        night: false,
        paged: false,
        readiumcss: true,
        sepia: false,
    },
};

export function readerReducer(
    state: ReaderState = initialState,
    action: Action,
): ReaderState {
    const newState = Object.assign({}, state);

    switch (action.type) {
        case readerActions.ActionType.OpenSuccess:
            newState.reader = action.payload.reader;
            return newState;
        case readerActions.ActionType.CloseSuccess:
            delete newState.reader;
            return newState;
        case readerActions.ActionType.ModeSetSuccess:
            newState.mode = action.payload.mode;
            return newState;
        case readerActions.ActionType.ConfigSetSuccess:
            newState.config = action.payload.config;
            return newState;
        default:
            return state;
    }
}
