#include <iostream>
#include <fstream>
#include <vector>
#include <stack>
#include "world.pb.h"
using namespace std;

#define SECTOR_SIZE 8

struct sector_t
{
    int cells[SECTOR_SIZE * SECTOR_SIZE];
};

string sub(string str, const string &oldStr, const string &newStr)
{
    string::size_type i = 0;
    while ((i = str.find(oldStr, i)) != string::npos)
    {
        str.replace(str.begin() + i, str.begin() + i + oldStr.size(), newStr.begin(), newStr.end());
        i += newStr.size();
    }
    return str;
}

string quote(const string &str)
{
    return '"' + sub(sub(str, "\\", "\\\\"), "\"", "\\\"") + '"';
}

// partial template specialization for strings and bools
template <typename T> void val(ostream *o, T value) { *o << value; }
template <> void val<const char *>(ostream *o, const char *value) { *o << quote(value); }
template <> void val<string>(ostream *o, string value) { *o << quote(value); }
template <> void val<bool>(ostream *o, bool value) { *o << (value ? "true" : "false"); }

class JSON
{
private:
    enum { ARRAY, PACKED_ARRAY, OBJECT };

    bool pack;
    stack<int> s;
    ostream *o;
    bool first;
    int i;

    string indent() { return is_packed() ? "" : string(2 * i, ' '); }
    bool in_array() { return !s.empty() && s.top() != OBJECT; }
    bool is_packed() { return pack || (!s.empty() && s.top() == PACKED_ARRAY); }

    void newline_indent()
    {
        if (is_packed()) *o << (first ? "" : ",") << indent();
        else *o << (first ? "\n" : ",\n") << indent();
        first = false;
    }

public:
    JSON(ostream *out, bool should_pack) : pack(should_pack), o(out), first(true), i(1) { *o << "{"; }
    ~JSON() { *o << (pack ? "}\n" : "\n}\n"); }

    JSON &name(const string &name)
    {
        newline_indent();
        *o << '"' << name << "\":" << (is_packed() ? "" : " ");
        first = false;
        return *this;
    }

    template <typename X> JSON &value(X x)
    {
        if (in_array()) newline_indent();
        val(o, x);
        return *this;
    }

    template <typename X, typename Y> JSON &value(X x, Y y)
    {
        return array(true).value(x).value(y).end();
    }

    JSON &array(bool packed)
    {
        if (in_array()) newline_indent();
        *o << '[';
        first = true;
        i++;
        s.push(packed ? PACKED_ARRAY : ARRAY);
        return *this;
    }

    JSON &object()
    {
        if (in_array()) newline_indent();
        *o << '{';
        first = true;
        i++;
        s.push(OBJECT);
        return *this;
    }

    JSON &end()
    {
        int t = s.top();
        first = false;
        i--;
        *o << (is_packed() ? "" : "\n") << indent() << (t == OBJECT ? '}' : ']');
        s.pop();
        return *this;
    }
};

void convert(const string &input, const string &output, bool pack)
{
    // open input
    ifstream in(input.c_str(), ios::in | ios::binary);
    if (!in.is_open())
    {
        cout << "error: could not open file \"" << input << "\"" << endl;
        return;
    }

    // parse file
    FileWorld world;
    if (!world.ParseFromIstream(&in))
    {
        cout << "error: could not parse file \"" << input << "\"" << endl;
        return;
    }

    // open output
    ofstream out(output.c_str());
    if (!out.is_open())
    {
        cout << "error: could not open file \"" << output << "\"" << endl;
        return;
    }

    JSON json(&out, pack);
    json.name("unique_id").value(world.unique_id());
    json.name("width").value(world.width() * SECTOR_SIZE);
    json.name("height").value(world.height() * SECTOR_SIZE);
    json.name("start").value(world.players_start_x(), world.players_start_y());
    json.name("end").value(world.players_end_x(), world.players_end_y());

    json.name("entities").array(false);
    for (int i = 0; i < world.door_size(); i++)
    {
        const FileDoor &door = world.door(i);
        json.object();
        json.name("class").value("wall");
        json.name("start").value(door.start_x(), door.start_y());
        json.name("end").value(door.end_x(), door.end_y());
        json.name("oneway").value(door.type() == FileDoor::ONE_WAY);
        json.name("open").value(door.state() == FileDoor::DOOR_OPEN);
        json.name("color").value(door.color());
        json.end();
    }
    for (int i = 0; i < world.cog_size(); i++)
    {
        const FileCog &cog = world.cog(i);
        json.object();
        json.name("class").value("cog");
        json.name("pos").value(cog.cog_x(), cog.cog_y());
        json.end();
    }
    for (int i = 0; i < world.button_size(); i++)
    {
        const FileButton &button = world.button(i);
        json.object();
        json.name("class").value("button");
        json.name("type").value(button.behavior());
        json.name("pos").value(button.position_x(), button.position_y());
        json.name("walls").array(true);
        for (int j = 0; j < button.door_index_size(); j++)
            json.value(button.door_index(j));
        json.end();
        json.end();
    }
    for (int i = 0; i < world.sign_size(); i++)
    {
        const FileSign &sign = world.sign(i);
        json.object();
        json.name("class").value("sign");
        json.name("pos").value(sign.sign_x(), sign.sign_y());
        json.name("text").value(sign.text());
        json.end();
    }
    for (int i = 0; i < world.enemy_size(); i++)
    {
        const FileEnemy &enemy = world.enemy(i);

        // convert enemy name from integer to string
        string type = FileEnemy_EnemyType_Name(enemy.type());
        type = sub(type, "ENEMY_RIOT_GUN", "jet stream");
        type = sub(type, "ENEMY_MULTI_THROW", "multi gun");
        type = sub(sub(type, "ENEMY_", ""), "_", " ");
        for (int j = 0; j < type.size(); j++)
            type[j] = tolower(type[j]);

        json.object();
        json.name("class").value("enemy");
        json.name("type").value(type);
        json.name("pos").value(enemy.center_x(), enemy.center_y());
        json.name("color").value(enemy.color());
        json.name("angle").value(enemy.angle());
        json.end();
    }
    json.end();

    json.name("cells").array(false);
    vector<sector_t> sectors;
    for (int i = 0; i < world.sector_size(); i++)
    {
        const FileSector &sector = world.sector(i);
        sector_t copy;
        for (int j = 0; j < SECTOR_SIZE * SECTOR_SIZE; j++)
            copy.cells[j] = sector.cell(j).type();
        sectors.push_back(copy);
    }
    int w = world.width(), h = world.height();
    for (int y = 0; y < h * SECTOR_SIZE; y++)
    {
        json.array(true);
        for (int x = 0; x < w * SECTOR_SIZE; x++)
        {
            int sx = x / SECTOR_SIZE;
            int sy = y / SECTOR_SIZE;
            json.value(sectors[sx + sy * w].cells[(x - sx * SECTOR_SIZE) + (y - sy * SECTOR_SIZE) * SECTOR_SIZE]);
        }
        json.end();
    }
    json.end();
}

int main(int argc, char *argv[])
{
    vector<string> args;
    vector<string>::iterator i;
    for (int i = 1; i < argc; i++)
        args.push_back(argv[i]);

    // parse flags
    bool pack = false;
    for (i = args.begin(); i != args.end(); i++)
    {
        if (*i == "--pack")
        {
            pack = true;
            args.erase(i);
            break;
        }
    }

    // print usage
    if (args.empty())
    {
        cout << "usage: level_converter [--pack] <lvl files>" << endl;
        return 0;
    }

    // compile files
    for (i = args.begin(); i != args.end(); i++)
    {
        string input = *i;
        string output = input;
        if (output.rfind(".lvl") == output.size() - 4) output = output.substr(0, output.size() - 4);
        output += ".json";
        convert(input, output, pack);
    }

    return 0;
}
