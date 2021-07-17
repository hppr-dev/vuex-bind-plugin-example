<template>
  <div id="app">
    <table>
      <tr>
        <td>
          <input v-model="city_one" v-on:keyup.enter="update_city_one_name(city_one)"/>
        </td>
        <td>
          <input v-model="city_two" v-on:keyup.enter="update_city_two_name(city_two)"/>
        </td>
      </tr>
      <tr>
        <td> Current Weather : {{ JSON.stringify(city_one_weather) }} </td>
        <td> Current Weather : {{ JSON.stringify(city_two_weather) }} </td>
      </tr>
    </table>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'

export default { 
  name : "App",
  data : function() {
    return {
      city_one : "",
      city_two : "",
    };
  },
  mounted : function() {
    this.$store.dispatch("weather/start_bind");
  },
  computed : {
    ...mapState("weather", ["city_one_weather", "city_two_weather"]),
  },
  methods : {
    ...mapMutations("weather", ["update_city_one_name", "update_city_two_name"]),
  }
}
</script>
