// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as moment from "moment";

import { ActionType, ApiAction } from "readium-desktop/common/redux/actions/api";

const initialState: any = {
    data: {},
    lastSuccess: null,
};

// The api reducer.
export function apiReducer(
    state: any = initialState,
    action: ApiAction,
) {
    switch (action.type) {
        case ActionType.Success:
            const data = state.data;
            const now = moment.now();
            data[action.meta.api.requestId] = {
                result: action.payload,
                requestId: action.meta.api.requestId,
                moduleId: action.meta.api.moduleId,
                methodId: action.meta.api.methodId,
                date: now,
            };
            return Object.assign(
                {},
                state,
                {
                    data,
                    lastSuccess: {
                        action,
                        date: now,
                    },
                },
            );
        case ActionType.Clean:
            const newState = Object.assign({}, state);
            delete newState.data[action.payload.requestId];
            return newState;
        default:
            return state;
    }
}
