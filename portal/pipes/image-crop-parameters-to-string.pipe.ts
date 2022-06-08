import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "imageCropParametersToString" })
export class ImageCropParametersToString implements PipeTransform {
    public transform(input: string): string {
        let cropParamsStr = "";

        if (input) {
            const inputStr = input;

            if (inputStr != null) {
                const parts = inputStr.split(",");
                if (parts.length > 1) {
                    cropParamsStr += "(";
                    cropParamsStr += parts
                        .slice(0, 2)
                        .reduce(
                            (memo, part: string) => (memo !== "" ? memo + ", " : memo) + parseFloat(part).toFixed(2),
                            ""
                        );
                    cropParamsStr += ")";
                }
                if (parts.length > 3) {
                    cropParamsStr += " \u2014 (";
                    cropParamsStr += parts
                        .slice(-2)
                        .reduce(
                            (memo, part: string) => (memo !== "" ? memo + ", " : memo) + parseFloat(part).toFixed(2),
                            ""
                        );
                    cropParamsStr += ")";
                }
            }
        }

        return cropParamsStr;
    }
}
