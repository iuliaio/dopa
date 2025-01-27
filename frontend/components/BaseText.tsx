import { StyleSheet, Text, TextProps } from "react-native";
import { Fonts } from "../assets/fonts";

const BaseText = ({ style, ...props }: TextProps) => {
  return <Text {...props} style={[styles.defaultText, style]} />;
};

const styles = StyleSheet.create({
  defaultText: {
    fontFamily: Fonts.inter.regular,
    fontSize: 16,
    color: "#000",
  },
});

export default BaseText;
