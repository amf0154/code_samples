import { Pipe, PipeTransform } from "@angular/core";
import { PortalHeaderSize } from "@onboard-shared/modules/audit-trail/models/audit-trail.model";
import { isNumber, isString } from "lodash";

@Pipe({ name: "headerSizeToString" })
export class HeaderSizeToString implements PipeTransform {
    public transform(input: PortalHeaderSize | string): string {
        let headerSizeStr = "";
        if (input) {
            let headerSize: PortalHeaderSize = null;

            if (isString(input)) {
                headerSize = parseInt(input, 10) as PortalHeaderSize;
            } else if (isNumber(input)) {
                headerSize = input as PortalHeaderSize;
            }

            if (headerSize != null) {
                switch (headerSize) {
                    case PortalHeaderSize.Small:
                        headerSizeStr = "Small";
                        break;
                    case PortalHeaderSize.Large:
                        headerSizeStr = "Large";
                        break;
                }
            }
        }

        return headerSizeStr;
    }
}
