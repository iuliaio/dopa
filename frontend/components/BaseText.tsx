import React from "react";
import { StyleProp, Text, TextProps, TextStyle } from "react-native";
import { Fonts } from "../assets/fonts";

type FontVariant = "regular" | "semiBold" | "bold";

type BaseTextProps = Omit<TextProps, "style"> & {
  variant?: FontVariant;
  size?: number;
  style?: StyleProp<TextStyle>;
};

const BaseText = ({
  variant = "regular",
  size = 16,
  style,
  ...props
}: BaseTextProps) => {
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: Fonts.inter[variant],
          fontSize: size,
        },
        style,
      ]}
    />
  );
};

export default BaseText;
