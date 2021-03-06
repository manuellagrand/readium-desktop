// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import { PublicationView } from "readium-desktop/common/views/publication";

import { LsdStatus, LsdStatusType } from "readium-desktop/common/models/lcp";

export function lcpReadable(publication: PublicationView, lsdStatus: LsdStatus): boolean {
    const isReadable = (!publication.lcp || (publication.lcp &&
        (lsdStatus.status === LsdStatusType.Active || lsdStatus.status === LsdStatusType.Ready)));
    return isReadable;
}
