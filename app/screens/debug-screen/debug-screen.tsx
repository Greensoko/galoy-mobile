import * as React from "react"
import { useCallback, useMemo } from "react"
import { Alert, DevSettings, Text, View } from "react-native"
import { Button, ButtonGroup } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { useApolloClient } from "@apollo/client"
import { Screen } from "../../components/screen"
import { color } from "../../theme"
import { resetDataStore } from "../../utils/logout"
import { getGraphQlUri, loadNetwork, saveNetwork } from "../../utils/network"
import { requestPermission } from "../../utils/notifications"
import useToken from "../../utils/use-token"
import { btc_price, walletIsActive } from "../../graphql/query"

import type { ScreenType } from "../../types/jsx"
import type { INetwork } from "../../types/network"

const styles = EStyleSheet.create({
  button: {
    marginHorizontal: "24rem",
    marginVertical: "6rem",
  },

  container: { marginLeft: 36, marginRight: 36, marginTop: 24 },
})

export const DebugScreen: ScreenType = () => {
  const client = useApolloClient()
  const { getTokenUid, getTokenNetwork, removeToken } = useToken()

  const networks: INetwork[] = ["regtest", "testnet", "mainnet"]
  const [networkState, setNetworkState] = React.useState("")
  const [graphQlUri, setGraphQlUri] = React.useState("")

  const setNetwork = useCallback(
    async (network?) => {
      let n

      const tokenNetwork = getTokenNetwork()

      if (tokenNetwork) {
        n = tokenNetwork
      } else if (!network) {
        n = await loadNetwork()
      } else {
        n = network
      }

      setGraphQlUri(await getGraphQlUri(n))
      setNetworkState(n)
    },
    [getTokenNetwork],
  )

  React.useEffect(() => {
    ;(async () => {
      setNetwork()
    })()
  }, [setNetwork])

  return (
    <Screen preset="scroll" backgroundColor={color.transparent}>
      {/* <Button
        title="Delete account and log out (TODO)"
        onPress={async () => {
          resetDataStore()
          if (token.has()) {
            try { // FIXME
              const query = `mutation deleteCurrentUser {
                deleteCurrentUser
              }`

              // const result = await request(getGraphQlUri(), query, {uid: "1234"})
              // FIXME
            } catch (err) {
              console.log(`${err}`)
            }
          }
          await token.delete()
          Alert.alert("user succesfully deleted. Restart your app")
        }}
        /> */}
      <Button
        title="Log out"
        style={styles.button}
        onPress={async () => {
          await resetDataStore({ client, removeToken })
          Alert.alert("state succesfully deleted. Restart your app")
        }}
      />
      <Button
        title="Send notifications"
        style={styles.button}
        onPress={async () => {
          // TODO
          // mutateTestMessage()
        }}
      />
      <Button
        title="Copy store"
        style={styles.button}
        onPress={() => {
          // Clipboard.setString(JSON.stringify(store))
          // Alert.alert("Store copied in clipboard. send it over whatsapp or email")
        }}
      />
      <Button
        title="Request permission + send device token"
        style={styles.button}
        onPress={async () => {
          walletIsActive(client) && requestPermission(client)
        }}
      />
      {__DEV__ && (
        <Button
          title="Reload"
          style={styles.button}
          onPress={() => DevSettings.reload()}
        />
      )}
      {/* <Button
          title="Crash test"
          style={styles.button}
          onPress={() => {
            crashlytics().log("Testing crash")
            crashlytics().crash()
          }}
        /> */}
      <View>
        <Text>
          UID:
          {getTokenUid()}
        </Text>
        <Text>
          token network:
          {getTokenNetwork()}
        </Text>
        <Text>
          GraphQlUri:
          {graphQlUri}
        </Text>
        <Text>
          BTC price:
          {btc_price(client)}
        </Text>
        <Text>
          Hermes:
          {String(!!global.HermesInternal)}
        </Text>

        <ButtonGroup
          onPress={(index) => {
            saveNetwork(networks[index])
            setNetwork(networks[index])
          }}
          selectedIndex={networks.findIndex((value) => value === networkState)}
          buttons={networks}
          buttonStyle={styles.button} // FIXME
          containerStyle={styles.container}
        />
      </View>
    </Screen>
  )
}
