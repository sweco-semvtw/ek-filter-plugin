# origo-filter-etuna

Gränssnitt för att filtrera föremål i kartan.

**Parametrar:**
- excludedAttributes: Egenskaper/attribut som inte ska listas i gränssnittet. Valfri.
- excludedLayers: Lager som inte ska listas i gränssnittet. Baseras på lagrets namn. Valfri.
- optionBackgroundColor: Bakgrundsfärg på filterade lager i lagerlistan. Valfri.
- filterPrefix: Prefix på filtrerade lager i lagerlistan. Valfri.

**Exempel:**
```HTML
<script type="text/javascript">
    var origo = Origo('index.json');
    origo.on('load', function (viewer) {
      var origofilteretuna = Origofilteretuna({
        excludedAttributes: ['geom', 'sokid'],
        excludedLayers: ['sokvyx_djupdata_djuppunkter_vy'],
        optionBackgroundColor: '#e1f2fe',
        filterPrefix: 'Filter - '
      });
      viewer.addComponent(origofilteretuna);
    });
</script>
```

### Demo filtrering
![](filter1.gif)
