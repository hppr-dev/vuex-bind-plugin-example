# vuex-bind-plugin-example

This is an example usage of creating a simple web app with vuex-bind-plugin.
A step-by-step tutorial of how to write it is included.

# Running

If you just want to run this and inspect the code:

1. Clone the repo on to your local machine
2. In the `weather` directory run `npm install`
3. Create an `.env.local` file in the `weather` directory with `VUE_APP_WEATHER_API_KEY="your key here"` with an api key from [openweathermap.org](http://openweathermap.org)
4. Go to [https://cors-anywhere.herokuapp.com/corsdemo](https://cors-anywhere.herokuapp.com/corsdemo) and enable demo access
5. Run `npm run serve` from the `weather` directory
6. Open a browser and navigate to http://localhost:8080 to see the demo

# Tutorial for creating this from scratch

For this example we want to create a page that queries weather information for multiple cities.

## Installing vue and vuex

First things first, we need to create a vue project with vuex:

```
  $ npm install @vue/cli
  $ vue create -b -d weather
  $ cd weather
  $ npm install vuex
```

## Installing vuex-bind-plugin

Now we want to install the star of the show: `vuex-bind-plugin`.
We can either install the most recent version from github by placing it in our dependencies in `weather/packages.json`:

```
...
  "dependencies": {
    "core-js": "^3.6.5",
    "vue": "^2.6.11",
    "vuex": "^3.6.2",
    "vuex-bind-plugin" : "hppr-dev/vuex-bind-plugin"
  },
...
```

and then running `npm install`.

Or the latest release from npm.

```
  $ npm install vuex-bind-plugin
```

For this example we're going to install it directly from github.

## Test Our Configuration

Now that we have dependencies installed, let's make sure that the configuration works by running `npm run serve` in the weather directory.

If everything went as planned, we should be able to access the page from a browser and see a nice welcome message.

## Create endpoint data

We are using the openweathermap apis to get the current weather information.
By inspecting the [api docs](http://openweathermap.org/api), we can write the following endpoints in `weather/src/endpoints.js`:

```
// endpoints.js
export default {
  current_weather : {
    url    : "/weather",
    type   : Object,
    params : {
      q     : String,
      appid : String,
    },
  },
}
```

## Create vuex module store with api bindings 

We want to show two locations current weather.
We'll need the name of the two cities and our api key as part of our state.
We don't want to push the api key to git, so we'll have that in our environment variables.
Everything else should be handled by the vuex-bind-plugin.

Let's take a moment to think about how we want to "bind" the api to our vuex store state.

Current weather data changes pretty frequently, so we'll want to `"watch"` the data from the api and also the data from the user.

Putting this all together we can put the following in our store config in `weather/src/weather_store.js`:

```
export default { 
  namespace : "weather",
  state     : {
    city_one_name : "",
    city_two_name : "",
    api_key       : process.env.VUE_APP_WEATHER_API_KEY
  },
  bindings  : {
    city_one_weather : {
      endpoint  : "current_weather", 
      bind      : "watch",
      period    : 60000,
      param_map : {
        city_one_name : "q",
        api_key       : "appid",
      },
    },
    city_two_weather : {
      endpoint  : "current_weather", 
      bind      : "watch",
      period    : 60000,
      param_map : {
        city_two_name : "q",
        api_key       : "appid",
      },
    },
  }
}
```


## Configure vuex and the vuex-bind-plugin

So now that we have our store config, we just need to implement it in our vue/vuex config.

```
import Vue from 'vue'
import Vuex from 'vuex'
import Bind from 'vuex-bind-plugin'
import App from './App.vue'
import endpoints from './endpoints.js'
import weather_store from './weather_store.js'

Vue.use(Vuex);

Vue.config.productionTip = false

new Vue({
  store : new Vuex.Store({
    // Configure Plugin
    plugins : [
      new Bind.Plugin({
        endpoints,
        sources : { url : "http://api.openweathermap.org/data/2.5/" }
      }),
    ],
    // Configure Module
    modules : Bind.Modules({
      weather_store
    }),
  },
  render: h => h(App),
}).$mount('#app')
```

## Configure API key

We can't forget that we need an api key to query the api.
We'll need to go to openweathermap.org and create an account to get an api key.

Once we have an api key we can store this in our `.env.local` file:

```
VUE_APP_WEATHER_API_KEY="my key"
```

After creating this file, we are ready to run `npm run serve` again and see our welcome message again.
If we have the vue development browser extension installed we can also inspect our vuex store and see we have the bind and weather vuex modules with some data in them.

## Update the UI

Let's make a basic UI.
We should have two text boxes that update the city names when enter is pressed and show the weather information beneath them.
We'll use a table to make it easy (even though it's not the prettiest or best practice).

Let's update our App.vue to have a table with our info in it:

```
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
  computed : {
    ...mapState("weather", ["city_one_weather", "city_two_weather"]),
  },
  methods : {
    ...mapMutations("weather", ["update_city_one_name", "update_city_two_name"]),
  },
}
</script>

```

Now we can run `npm run serve` again and check that our interface is what we expect.

## Initialize the bindings

To start querying the api, all we need to do is to dispatch the `"weather/start_bind"` action.
This will start monitoring our city parameters and get api data when they change.

A good place for this is in the mounted method of our App.vue script:

```
...
export default {
  name : "App",
  mounted : function() {
    this.$store.dispatch("weather/start_bind");
  },
  ...
}
```

## Dealing with CORS errors

If we were to try to `npm run serve` right now, we would get our interface, but when we enter a city name, it would not populate.
This is because of openweathermap.org does not support CORS requests.
We can deal with this in a number of ways, but this is just an example so we'll use cors-anywhere to demo our page.
To do this we just need to update our url in `weather/src/main.js`:

```
...
new Vue({
  store : new Vuex.Store({
    ...
    plugins : [
      new Bind.Plugin({
        endpoints,
        sources : {
          url : "https://cors-anywhere.herokuapp.com/http://api.openweathermap.org/data/2.5/",
        },
      }),
    ],
    ...
}).$mount('#app')
```

After making this change we will need to go to "https://cors-anywhere.herokuapp.com/corsdemo" to allow our requests.
This is just for a demo, so do not use this technique as a permanent solution.

Now when we run `npm run serve`, in our browser we'll see:
 - When we put in "London" into the left text box and press enter, it will show us the weather data for London.
 - When we put in "Paris" into a right text box and press enter, it will show us the weather data for Paris.

## Going further

If we were to want to go further with this example there are a number of things we could do:

- Make the UI only show what we want
- Transform the returned data to only store what we want
- Change the input method
- Let the user choose the units or language

But these things are outside the scope of this tutorial.
Refer to the [vuex-bind-plugin github](https://github.com/hppr-dev/vuex-bind-plugin) for a more in-depth description of what it can do.

