import { useIsFocused, useNavigation } from "@react-navigation/native"
import * as React from "react"
import { Alert, Dimensions, Platform, Pressable, View, ViewStyle } from "react-native"
import { RNCamera } from "react-native-camera"
import EStyleSheet from "react-native-extended-stylesheet"
import ImagePicker from 'react-native-image-picker'
import Svg, { Circle } from "react-native-svg"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { StoreContext } from "../../models"
import { palette } from "../../theme/palette"
import { validPayment } from "../../utils/parsing"
import { Token } from "../../utils/token"
const LocalQRCode = require('@remobile/react-native-qrcode-local-image');


const CAMERA: ViewStyle = {
  width: "100%",
  height: "100%",
  position: "absolute",
}

const { width: screenWidth } = Dimensions.get("window")
const { height: screenHeight } = Dimensions.get("window")

const styles = EStyleSheet.create({
  rectangleContainer: {
    position: 'absolute', 
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },

	rectangle: {
    height: screenWidth * .65,
    width: screenWidth * .65,
		borderWidth: 2,
		borderColor: palette.blue,
		backgroundColor: 'transparent',
  },
})


export const ScanningQRCodeScreen = () => {
  const { navigate, goBack } = useNavigation()
  const store = React.useContext(StoreContext)

  const [pending, setPending] = React.useState(false)

  const decodeInvoice = async (data) => {
    if (pending) {
      return
    }

    try {
      const {valid, errorMessage, paymentType, hash} = validPayment(data, new Token().network, store.myPubKey, store.username)
      console.tron.logImportant({valid, errorMessage, data} , "result")
      if (valid && paymentType === "faucet") {
        setPending(true)
        const result = await store.mutateFaucet({ hash })
        Alert.alert(
          result.faucet.success ? translate("common.success") : translate("common.error"),
          result.faucet.success ? result.faucet.message : "there were an error scanning this QRCode. Maybe it has already been used",
          [{
            text: translate("common.ok"), onPress: goBack
          }]
        )
      } else if (valid) {
        navigate("sendBitcoin", { payment: data })
      } else {
        setPending(true)
        Alert.alert(
          translate("ScanningQRCodeScreen.invalidTitle"),
          translate("ScanningQRCodeScreen.invalidContent", {found: data.toString()}),
          [{
            text: translate("common.ok"), onPress: () => setPending(false)
          }]
        )
      }
    } catch (err) {
      Alert.alert(err.toString())
    }
  }

  const showImagePicker = () => {
    ImagePicker.launchImageLibrary({
      title: null,
      mediaType: 'photo',
      takePhotoButtonTitle: null,
    },
    response => {
      if (response.uri) {
        const uri = Platform.OS === 'ios' ? response.uri.toString().replace('file://', '') : response.path.toString();
        LocalQRCode.decode(uri, (error, result) => {
          if (!error) {
            decodeInvoice( result );
          } else {
            if (error.message === "Feature size is zero!") {
              Alert.alert(translate("ScanningQRCodeScreen.noQrCode"));
            } else {
              console.tron.log({error})
              Alert.alert(error.message);
            }
          }
        });
      }
    },
  )}

  return (
    <Screen unsafe={true}>
      {useIsFocused() &&
      <RNCamera
        style={CAMERA}
        captureAudio={false}
        onBarCodeRead={(event) => {
          const qr = event.data
          decodeInvoice(qr)
        }}
        onTap={(r) => console.tron.log({r})}
        >
        <View style={styles.rectangleContainer}>
          <View style={[styles.rectangle]} />
        </View>
        <Pressable onPress={goBack}>
          <View style={{width: 64, height: 64, alignSelf: "flex-end", marginTop: 40, marginRight: 16}}>
            <Svg viewBox="0 0 100 100">
              <Circle cx={50} cy={50} r={50} fill={palette.white} opacity={.5} />
            </Svg>
            <Icon name="ios-close" size={64} style={{position: "absolute", top: -2}} />
          </View>
        </Pressable>
        <View style={{position: "absolute", width: screenWidth, height: 128, top: screenHeight - 96, left: 32}}>
          <Pressable onPress={showImagePicker}>
            <Icon name="image" size={64} color={palette.lightGrey} style={{opacity: .8}} />
          </Pressable>
        </View>
      </RNCamera>}
    </Screen>
  )
}