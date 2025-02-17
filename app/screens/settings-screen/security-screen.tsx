import * as React from "react"
import { useState } from "react"
import { RouteProp, useFocusEffect } from "@react-navigation/native"
import { Text, View } from "react-native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Button, Switch } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"

import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"
import { translate } from "../../i18n"
import BiometricWrapper from "../../utils/biometricAuthentication"
import { toastShow } from "../../utils/toast"
import type { ScreenType } from "../../types/jsx"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { PinScreenPurpose } from "../../utils/enum"
import KeyStoreWrapper from "../../utils/storage/secureStorage"

const styles = EStyleSheet.create({
  button: {
    backgroundColor: palette.white,
    paddingBottom: 16,
    paddingLeft: 0,
    paddingRight: 16,
    paddingTop: 16,
  },

  buttonTitle: {
    color: palette.black,
    fontSize: 16,
    fontWeight: "normal",
  },

  container: {
    backgroundColor: palette.white,
    minHeight: "100%",
    paddingLeft: 24,
    paddingRight: 24,
  },

  description: {
    color: palette.darkGrey,
    fontSize: 14,
    marginTop: 2,
  },

  settingContainer: {
    borderBottomColor: palette.lightGrey,
    borderBottomWidth: 1,
    flexDirection: "row",
  },

  subtitle: {
    fontSize: 16,
    marginTop: 16,
  },

  switch: {
    bottom: 18,
    position: "absolute",
    right: 0,
  },

  textContainer: {
    marginBottom: 12,
    marginRight: 60,
    marginTop: 32,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
})

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "security">
  route: RouteProp<RootStackParamList, "security">
}

export const SecurityScreen: ScreenType = ({ route, navigation }: Props) => {
  const { mIsBiometricsEnabled, mIsPinEnabled } = route.params

  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(mIsBiometricsEnabled)
  const [isPinEnabled, setIsPinEnabled] = useState(mIsPinEnabled)

  useFocusEffect(() => {
    getIsBiometricsEnabled()
    getIsPinEnabled()
  })

  const getIsBiometricsEnabled = async () => {
    setIsBiometricsEnabled(await KeyStoreWrapper.getIsBiometricsEnabled())
  }

  const getIsPinEnabled = async () => {
    setIsPinEnabled(await KeyStoreWrapper.getIsPinEnabled())
  }

  const onBiometricsValueChanged = async (value) => {
    if (value) {
      try {
        if (await BiometricWrapper.isSensorAvailable()) {
          // Presents the OS specific authentication prompt
          BiometricWrapper.authenticate(
            translate("AuthenticationScreen.setUpAuthenticationDescription"),
            handleAuthenticationSuccess,
            handleAuthenticationFailure,
          )
        } else {
          toastShow(translate("SecurityScreen.biometryNotAvailable"))
        }
      } catch {
        toastShow(translate("SecurityScreen.biometryNotEnrolled"))
      }
    } else {
      if (await KeyStoreWrapper.removeIsBiometricsEnabled()) {
        setIsBiometricsEnabled(false)
      }
    }
  }

  const handleAuthenticationSuccess = async () => {
    if (await KeyStoreWrapper.setIsBiometricsEnabled()) {
      setIsBiometricsEnabled(true)
    }
  }

  const handleAuthenticationFailure = () => {
    // This is called when a user cancels or taps out of the authentication prompt,
    // so no action is necessary.
  }

  const onPinValueChanged = async (value) => {
    if (value) {
      navigation.navigate("pin", { screenPurpose: PinScreenPurpose.SetPin })
    } else {
      removePin()
    }
  }

  const removePin = async () => {
    if (await KeyStoreWrapper.removePin()) {
      KeyStoreWrapper.removePinAttempts()
      setIsPinEnabled(false)
    }
  }

  return (
    <Screen style={styles.container} preset="scroll">
      <View style={styles.settingContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{translate("SecurityScreen.biometricTitle")}</Text>
          <Text style={styles.subtitle}>
            {translate("SecurityScreen.biometricSubtitle")}
          </Text>
          <Text style={styles.description}>
            {translate("SecurityScreen.biometricDescription")}
          </Text>
        </View>
        <Switch
          style={styles.switch}
          value={isBiometricsEnabled}
          color={palette.lightBlue}
          onValueChange={(value) => onBiometricsValueChanged(value)}
        />
      </View>
      <View style={styles.settingContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{translate("SecurityScreen.pinTitle")}</Text>
          <Text style={styles.subtitle}>{translate("SecurityScreen.pinSubtitle")}</Text>
          <Text style={styles.description}>
            {translate("SecurityScreen.pinDescription")}
          </Text>
        </View>
        <Switch
          style={styles.switch}
          value={isPinEnabled}
          color={palette.lightBlue}
          onValueChange={(value) => onPinValueChanged(value)}
        />
      </View>
      <View style={styles.settingContainer}>
        <Button
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
          title={translate("SecurityScreen.setPin")}
          onPress={() =>
            navigation.navigate("pin", { screenPurpose: PinScreenPurpose.SetPin })
          }
        />
      </View>
    </Screen>
  )
}
