import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { Colours } from "../assets/colours";
import { Fonts } from "../assets/fonts";
import BaseText from "./BaseText";

type CustomInputProps = {
  label: string;
  isFocused: boolean;
  isTextVisible?: boolean;
  onIconPress?: () => void;
  style?: StyleProp<ViewStyle | TextStyle>;
} & TextInputProps;

const CustomInput = ({
  label,
  isFocused,
  isTextVisible = true,
  onIconPress,
  style,
  ...props
}: CustomInputProps) => {
  const passwordInput = (
    <View>
      <BaseText style={styles.label}>{label}</BaseText>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: isFocused
                ? Colours.highlight.primary
                : Colours.neutral.primary,
            },
            style,
          ]}
          secureTextEntry={!isTextVisible}
          {...props}
        />
        {!!onIconPress && (
          <TouchableOpacity onPress={onIconPress} style={styles.eyeIcon}>
            <BaseText>
              {isTextVisible ? (
                <Feather
                  name="eye-off"
                  size={16}
                  color={Colours.neutral.dark5}
                />
              ) : (
                <Feather name="eye" size={16} color={Colours.neutral.dark5} />
              )}
            </BaseText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return passwordInput;
};

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontFamily: Fonts.inter.semiBold,
    color: Colours.neutral.dark1,
    marginLeft: 4,
    paddingBottom: 8,
  },
  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
    color: Colours.neutral.dark1,
    backgroundColor: Colours.neutral.white,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    padding: 10,
  },
});

export default CustomInput;
