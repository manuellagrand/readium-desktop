// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

export enum UserKeyCheckStatus {
    Pending,
    Error,
    Success,
}

export interface LsdInfo {
    statusUrl: string;
}

export interface LcpRights {
    print?: number;
    copy?: number;
    start?: Date;
    end?: Date;
}

export interface LcpInfo {
    provider: string;
    issued: Date;
    updated?: Date;
    lsd?: LsdInfo;
    rights: LcpRights;
}

export interface DeviceConfig {
    [key: string]: any;
}

export enum LsdStatusType {
    Active = "active",
    Expired = "expired",
    Ready = "ready",
    Revoked = "revoked",
}

export interface LsdStatus {
    events: any[];
    id: string;
    links: any[];
    message: string;
    status: LsdStatusType;
    updated: {
        license: string;
        status: string;
    };
}
