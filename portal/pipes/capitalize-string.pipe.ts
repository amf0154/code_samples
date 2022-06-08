import { Pipe, PipeTransform } from "@angular/core";
import * as _ from "lodash";

@Pipe({ name: "capitalizeString" })
export class CapitalizeString implements PipeTransform {
    public transform(input: string): string {
        let output = input;

        if (!_.isUndefined(input)) {
            input = input.toString();
            if (input.length > 0) {
                const letter = input.charAt(0).toUpperCase();

                if (input.length > 1) {
                    output = letter + input.substring(1).toLowerCase();
                } else {
                    output = letter + "";
                }
            }
        }

        return output;
    }
}
